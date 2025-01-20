import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Config } from '../Config.ts';
import { PerfTime, PoseSystem } from '../mocap/PoseSystem.ts';
import { Render3D } from '../mocap/Render3D.tsx';
import { VideoCamera, VideoConsumer } from '../mocap/VideoCamera.tsx';
import { Titles } from './Titles.tsx';

const poseSystem = new PoseSystem();

interface HomeProps {
  config: Config;
}

const PerfDetail = ({ perfTime }: { perfTime: PerfTime }) => {
  const formatNumber = (value: number) => {
    if (isNaN(value)) {
      return '?';
    } else {
      return value.toFixed(2);
    }
  };
  const sx = {
    fontFamily: '"JetBrainsMono Nerd Font", monospace',
    fontSize: '22px',
    fontWeight: 'bold',
    textShadow: '0 0 5px rgba(200, 50, 50, 0.7), 0 0 8px rgba(200, 50, 50, 0.4)',
  };
  // TODO format prettier with grid:
  return <>
    <Typography sx={sx}>{formatNumber(perfTime.msVisionTime)} ms vision</Typography>
    <Typography sx={sx}>{formatNumber(perfTime.msRenderTime)} ms render</Typography>
    <Typography sx={sx}>{formatNumber(perfTime.msUpdateTime)} ms update</Typography>
    <Typography sx={sx}>{formatNumber(1000 / perfTime.msUpdateTime)} Hz u-freq</Typography>
  </>;
};

const PerfPanel = ({ perfTime }: { perfTime: PerfTime }) => {
  const perfDetail = perfTime.ready() ? <PerfDetail perfTime={perfTime} /> :
    <CircularProgress sx={{ m: 4 }} color="error" size={88}/>;

  return <Stack sx={{
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'red',
    display: 'flex', alignItems: 'end',
    padding: 3,
    margin: 2,
    border: "red dashed thin",
    position: 'absolute', right: 0, top: 0, zIndex: 500,
  }}>
    {perfDetail}
  </Stack>;
};

function Splash({showSplash}: { showSplash: boolean }) {
  return <Box sx={{
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    justifyItems: "center",
    p: 10, width: "50%",
    height: "50%",
    border: "pink dotted thick",
    zIndex: 500,
    visibility: showSplash ? "visible" : "hidden",
  }}>
    <Titles titleFontSize={80} authorFontSize={44}/>
  </Box>;
}

const Home = ({ config }: HomeProps) => {
  const [showSplash, setShowSplash] = useState(true);
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
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const renderer: VideoConsumer = {
    video: async (video: HTMLVideoElement, startTimeMs: number, _deltaMs: number): Promise<void> => {
      if (staticCanvas.current) {
        if (showSplash) {
          setShowSplash(false)
        }
        await poseSystem.drawLandmarks(video, startTimeMs, staticCanvas.current, 50);
      }
    }
  };

  return (
    <Box className="App-body" sx={{position: "absolute", alignContent: "center", justifyItems: "center", top: 0, left: 0, width: "100%", height: "100%"}}>
      <Splash showSplash={showSplash} />
      {config.perf && perfTime && <PerfPanel perfTime={perfTime} />}
      <canvas ref={staticCanvas} id="main_view"
              style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '50%' }}></canvas>
      <Box sx={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        zIndex: 50,
        visibility: config.camera ? 'visible' : 'hidden',
      }}>
        <VideoCamera consumers={[renderer]} />
      </Box>
      <Render3D sx={{position: 'absolute', left: 0, bottom: 0, width: '50%', height: '50%'}}/>
    </Box>
  );
};

export default Home;
