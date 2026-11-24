import { MutableRefObject, useEffect, useRef } from 'react';

interface VideoConsumer {
  video: (video: HTMLVideoElement, startTimeMs: number, deltaMs: number) => Promise<void>;
}

/**
 * Live camera stream or recording url.
 */
type VideoSource = MediaStream | string | null;

/**
 * Single on-page video component subscribed to by the given consumers. Plays either the live camera or a looping
 * recording through the same element so downstream processing is identical.
 * @param consumers each will be passed the video on each frame update.
 * @param source what to play.
 * @param videoRef exposes the element for transport control.
 * @param onError called when the source fails to load.
 */
function VideoCamera({
  consumers,
  source,
  videoRef,
  onError,
}: {
  consumers: VideoConsumer[];
  source: VideoSource;
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  onError: () => void;
}) {
  const lastVideoTimeRef = useRef(-1);
  const lastFrameStartMsRef = useRef(performance.now());

  // the camera loop starts once, so it reads consumers through a ref; callers must pass a stable list
  const consumersRef = useRef(consumers);

  useEffect(() => {
    let animationFrameId: number;
    let cancelled = false;
    async function readVideoFrame() {
      const video = videoRef.current;
      const startTimeMs = performance.now();
      if (
        video &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.currentTime !== lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current = video.currentTime;
        const deltaMs = startTimeMs - lastFrameStartMsRef.current;
        lastFrameStartMsRef.current = startTimeMs;
        await Promise.all(consumersRef.current.map((c) => c.video(video, startTimeMs, deltaMs)));
      }
      if (!cancelled) {
        animationFrameId = window.requestAnimationFrame(readVideoFrame);
      }
    }
    readVideoFrame();
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) {
      return;
    }
    if (typeof source === 'string') {
      video.srcObject = null;
      video.src = source;
    } else {
      video.removeAttribute('src');
      video.srcObject = source;
    }
    video.play().catch(() => {
      // no source yet or interrupted by a newer source
    });
  }, [source, videoRef]);

  // we seemingly need to attach camera video stream to an on-page html element probably so it binds to gpu context
  // enabling gpu ai model direct access to the video frame, it can be hidden:
  // {display: none} breaks it but {visibility: hidden} does not
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      loop={typeof source === 'string'}
      onError={onError}
      style={{ transform: 'scaleX(-1)' }}
    ></video>
  );
}

export { VideoCamera, type VideoConsumer, type VideoSource };
