import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Config } from '../Config.ts';
import { PerfTime } from '../mocap/PerfTime.ts';
import { PoseSystem } from '../mocap/PoseSystem.ts';
import { Render3D } from '../mocap/Render3D.tsx';
import { VideoCamera, VideoConsumer } from '../mocap/VideoCamera.tsx';
import { PerfPanel } from './PerfPanel.tsx';
import { Splash } from './Splash.tsx';

const poseSystem = new PoseSystem();

interface HomeProps {
  config: Config;
}

const Home = ({ config }: HomeProps) => {
  const [showSplash, setShowSplash] = useState(true);
  const stickFigureCanvas = useRef<HTMLCanvasElement | null>(null);
  poseSystem.setConfig(config);
  const [perfTime, setPerfTime] = useState<PerfTime>(PerfTime.NULL);
  useEffect(() => {
    console.log("setup stats updater");
    let animationFrameId: number;
    const updateStats = () => {
      setPerfTime(poseSystem.calcPerfTime());
      animationFrameId = requestAnimationFrame(updateStats);
    };
    updateStats();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stickFigureCanvas]);

  const renderer: VideoConsumer = {
    video: async (video: HTMLVideoElement, startTimeMs: number, _deltaMs: number): Promise<void> => {
      if (stickFigureCanvas.current) {
        if (showSplash) {
          setShowSplash(false)
        }
        await poseSystem.detect(video, startTimeMs);
        poseSystem.justDraw(stickFigureCanvas.current, 50);
      }
    }
  };
  return (
    <Box className="App-body" sx={{position: "absolute", alignContent: "center", justifyItems: "center", top: 0, left: 0, width: "100%", height: "100%"}}>
      <Splash showSplash={showSplash} />
      {config.perf && perfTime && <PerfPanel perfTime={perfTime} />}
      <canvas ref={stickFigureCanvas} id="main_view"
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
      <Render3D sx={{position: 'absolute', left: 0, bottom: 0, width: '50%', height: '50%'}} poseSupplier={poseSystem.subscribe}/>
    </Box>
  );
};

export default Home;
