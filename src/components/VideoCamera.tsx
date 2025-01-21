import { MutableRefObject, useEffect, useRef, useState } from 'react';

interface VideoConsumer {
  video: (video: HTMLVideoElement, startTimeMs: number, deltaMs: number) => Promise<void>,
}

/**
 * Single on-page video camera component subscribed to by the given consumers.
 * Expected consumers include client-side ai models for vision and streaming to server, depending on settings
 * and current state.
 * @param consumers each will be passed the video on each frame update.
 */
function VideoCamera({ consumers }: { consumers: VideoConsumer[] }) {
  const camRef: MutableRefObject<HTMLVideoElement | null> = useRef(null);
  const [lastVideoTime, setLastVideoTime] = useState(-1);

  useEffect(() => {
    if (camRef.current !== null) {
      camRef.current.volume = 0;

      async function readVideoFrame() {
        let startTimeMs = performance.now();
        if (camRef.current!.currentTime !== lastVideoTime) {
          setLastVideoTime(camRef.current!.currentTime);
          await Promise.all(consumers.map(c => c.video(camRef.current!, startTimeMs, startTimeMs - lastVideoTime)));
        }
        window.requestAnimationFrame(readVideoFrame);
      }

      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
          if (camRef.current) {
            camRef.current.srcObject = stream;
            camRef.current.addEventListener('loadeddata', readVideoFrame);
          }
        })
        .catch((err) => {
          // camRef will simply not be set
          console.error(`webcam error: `, err);
        });
    }
  }, []);
  // we seemingly need to attach camera video stream to an on-page html element probably so it binds to gpu context
  // enabling gpu ai model direct access to the video frame, it can be hidden:
  // {display: none} breaks it but {visibility: hidden} does not
  return <video ref={camRef} autoPlay playsInline style={{ transform: 'scaleX(-1)' }}></video>;
}

export { VideoCamera, type VideoConsumer };
