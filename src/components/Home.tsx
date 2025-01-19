import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import {Config} from "../Config.ts";
import {VideoCamera, VideoConsumer} from "../mocap/VideoCamera.tsx";
import { PerfTime, PoseSystem } from '../mocap/PoseSystem.ts';
import { useEffect, useRef, useState } from 'react';

const poseSystem = new PoseSystem();

interface HomeProps {
  config: Config;
}

const PerfDetail = ({perfTime}: { perfTime: PerfTime }) => {
  const formatNumber = (value: number) => {
    if (isNaN(value)) {
      return "?"
    } else {
      return value.toFixed(2);
    }
  }
  const statStyle = {
    fontFamily: "monospace",
    fontSize: "14px",
  };
  return <><Typography sx={statStyle}>vision {formatNumber(perfTime.msVisionTime)} ms</Typography>
  <Typography sx={statStyle}>render {formatNumber(perfTime.msRenderTime)} ms</Typography>
  <Typography sx={statStyle}>update {formatNumber(perfTime.msUpdateTime)} ms</Typography>
  <Typography sx={statStyle}>ups {formatNumber(1000 / perfTime.msUpdateTime)} Hz</Typography></>
}

const PerfPanel = ({perfTime}: { perfTime: PerfTime }) => {
  const perfDetail = perfTime.ready() ? <PerfDetail perfTime={perfTime} /> : <CircularProgress sx={{m:2}} color="success" />;

  return <Stack sx={{
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: "lightgreen",
    display: "flex", alignItems: "end",
    padding: 2,
    position: "absolute", right: 0, top: 0, zIndex: 500
  }}>
    {perfDetail}
  </Stack>;
}

const Home = ({config}: HomeProps) => {
  const staticCanvas = useRef<HTMLCanvasElement | null>(null);
  poseSystem.setConfig(config);
  const [perfTime, setPerfTime] = useState<PerfTime>(PerfTime.NULL);
  useEffect(() => {
    let animationFrameId: number;

    const updateStats = () => {
      setPerfTime(poseSystem.getPerfTime());
      animationFrameId = requestAnimationFrame(updateStats);
    };

    updateStats();

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
    };

  }, []);

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
          {config.perf && perfTime && <PerfPanel perfTime={perfTime}/>}
          <canvas ref={staticCanvas} id="main_view" height="100%"
                  style={{position: "absolute", left: 0, top: 0, width: "100%", height: "100%"}}></canvas>
          <Box sx={{position: "absolute", right: 0, bottom: 0, zIndex: 100, visibility: config.camera ? "visible": "hidden"}}>
            <VideoCamera consumers={tempVc}/>
          </Box>
      </Box>
  );
};

export default Home;
