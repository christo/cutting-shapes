import {MutableRefObject, useEffect, useRef, useState} from "react";
import {Stack} from "@mui/material";
import {PoseSystem} from "./PoseSystem.ts";
import {Detection} from "@mediapipe/tasks-vision";

type VisionConsumer = {
  video: (video: HTMLVideoElement, startTimeMs: number, deltaMs: number) => Promise<void>,
  image: (image: HTMLImageElement) => Promise<void>,
}


/**
 * Single on-page video camera component subscribed to by the given consumers.
 * Expected consumers include client-side ai models for vision and streaming to server, depending on settings
 * and current state.
 * @param consumers each will be passed the video on each frame update.
 */
function VideoCamera({consumers}: { consumers: VisionConsumer[] }) {
  const camRef: MutableRefObject<HTMLVideoElement | null> = useRef(null);
  const [lastVideoTime, setLastVideoTime] = useState(-1);

  useEffect(() => {
    if (camRef.current !== null) {
      // TODO confirm the audio can be read by consumers but is simply not monitored to client
      camRef.current.volume = 0;

      async function readVideoFrame() {
        let startTimeMs = performance.now();
        if (camRef.current!.currentTime !== lastVideoTime) {
          setLastVideoTime(camRef.current!.currentTime);
          await Promise.all(consumers.map(c => c.video(camRef.current!, startTimeMs, startTimeMs - lastVideoTime)));
        }
        window.requestAnimationFrame(readVideoFrame);
      }

      navigator.mediaDevices.getUserMedia({video: true, audio: true})
          .then(function (stream) {
            if (camRef.current) {
              camRef.current.srcObject = stream;
              camRef.current.addEventListener("loadeddata", readVideoFrame);
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
  return <Stack sx={{position: "absolute", top: 0, right: 0, visibility: "hidden"}}>
    <video ref={camRef} autoPlay playsInline></video>
  </Stack>;
}

const PERIOD_DETECT_PERSON_MS = 2000;

function poseConsumer(poseSystem: PoseSystem, setPeople: (d: Detection[]) => void) {
  let lastPeopleUpdate = 0;
  return {
    async image(image: HTMLImageElement): Promise<void> {
      const od = await poseSystem.personDetect("VIDEO");
      const detections = od.detect(image);
      const ds = detections.detections;
      setPeople(ds);
      return Promise.resolve();
    },
    async video(video: HTMLVideoElement, startTimeMs: number, _deltaMs: number): Promise<void> {
      if (Date.now() - lastPeopleUpdate > PERIOD_DETECT_PERSON_MS) {
        const od = await poseSystem.personDetect("VIDEO");
        const detections = od.detectForVideo(video, startTimeMs);
        const ds = detections.detections;
        setPeople(ds);
      }
    }
  } as VisionConsumer;
}


export {VideoCamera, poseConsumer, type VisionConsumer};
