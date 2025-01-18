import {Box, Typography} from "@mui/material";
import {Config} from "../Config.ts";
import {VideoCamera, VideoConsumer} from "../mocap/VideoCamera.tsx";
import {PoseSystem} from "../mocap/PoseSystem.ts";
import {useRef} from "react";

const poseSystem = new PoseSystem();

interface HomeProps {
  config: Config;
}

const Home = ({config}: HomeProps) => {
  const staticCanvas = useRef<HTMLCanvasElement | null>(null);
  poseSystem.setConfig(config);

  const tempVc: VideoConsumer[] = [{
    video: async (video: HTMLVideoElement, startTimeMs: number, _deltaMs: number): Promise<void> => {
      if (staticCanvas.current) {
        await poseSystem.drawLandmarks(video, startTimeMs, staticCanvas.current, 50);
      }
      return;
    }
  }];

  return (
      <Box className="App-body">
        <Typography variant="h2">Cutting Shapes</Typography>
        <Box sx={{border: "orange dotted thick", p: 2, bgcolor: 'green', w: "100%", h: "100%"}}>
          <canvas ref={staticCanvas} id="main_view" width="100%" height="100%"
                  style={{position: "relative", left: 0, top: 0, width: "100%", height: "100%"}}></canvas>
          <VideoCamera consumers={tempVc}/>
        </Box>
      </Box>
  );
};

export default Home;
