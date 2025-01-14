import {Box, Typography} from "@mui/material";
import {VideoCamera, VisionConsumer} from "../mocap/VideoCamera.tsx";
import {PoseSystem} from "../mocap/PoseSystem.ts";
import {useRef} from "react";

const poseSystem = new PoseSystem();

function drawX(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;

  // Draw first diagonal (top-left to bottom-right)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.stroke();

  // Draw second diagonal (top-right to bottom-left)
  ctx.beginPath();
  ctx.moveTo(canvas.width, 0);
  ctx.lineTo(0, canvas.height);
  ctx.stroke();
}

const Home = () => {
  const staticCanvas = useRef<HTMLCanvasElement | null>(null);

  if (staticCanvas.current) {
    drawX(staticCanvas.current)
  }
  const tempVc: VisionConsumer[] = [{
    video: async (video: HTMLVideoElement, startTimeMs: number, _deltaMs: number): Promise<void> => {
      if (staticCanvas.current) {
        await poseSystem.drawLandmarks(video, startTimeMs, staticCanvas.current, 50);
      }
      return;
    },
    image: async (_image: HTMLImageElement): Promise<void> => {
      console.log(`consumeImage`);
      return Promise.reject("not implemented");
    }
  }];

  return (
    <Box className="App-body">
      <Typography variant="h2">Cutting Shapes</Typography>
      <Box sx={{border: "orange dotted thick", p: 2, bgcolor: 'green', w: "100%", h: "100%"}}>
        <canvas ref={staticCanvas} id="main_view" width="100%" height="100%" style={{position: "relative", left: 0, top: 0, width: "100%", height: "100%"}}></canvas>
        <VideoCamera consumers={tempVc}/>
      </Box>
    </Box>
  );
};

export default Home;
