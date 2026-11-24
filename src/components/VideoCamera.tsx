import { MutableRefObject, useEffect, useRef } from 'react';

interface VideoConsumer {
  video: (video: HTMLVideoElement, startTimeMs: number, deltaMs: number) => Promise<void>;
}

/**
 * Single on-page video camera component subscribed to by the given consumers.
 * Expected consumers include client-side ai models for vision and streaming to server, depending on settings
 * and current state.
 * @param consumers each will be passed the video on each frame update.
 */
function VideoCamera({ consumers }: { consumers: VideoConsumer[] }) {
  const camRef: MutableRefObject<HTMLVideoElement | null> = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lastFrameStartMsRef = useRef(performance.now());

  // the camera loop starts once, so it reads consumers through a ref; callers must pass a stable list
  const consumersRef = useRef(consumers);

  useEffect(() => {
    const cam = camRef.current;
    if (cam === null) {
      return;
    }
    cam.volume = 0;

    async function readVideoFrame() {
      const startTimeMs = performance.now();
      if (cam!.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = cam!.currentTime;
        const deltaMs = startTimeMs - lastFrameStartMsRef.current;
        lastFrameStartMsRef.current = startTimeMs;
        await Promise.all(consumersRef.current.map((c) => c.video(cam!, startTimeMs, deltaMs)));
      }
      window.requestAnimationFrame(readVideoFrame);
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(function (stream) {
        cam.srcObject = stream;
        cam.addEventListener('loadeddata', readVideoFrame);
      })
      .catch((err) => {
        console.error(`webcam error: `, err);
      });
  }, []);
  // we seemingly need to attach camera video stream to an on-page html element probably so it binds to gpu context
  // enabling gpu ai model direct access to the video frame, it can be hidden:
  // {display: none} breaks it but {visibility: hidden} does not
  return <video ref={camRef} autoPlay playsInline style={{ transform: 'scaleX(-1)' }}></video>;
}

export { VideoCamera, type VideoConsumer };
