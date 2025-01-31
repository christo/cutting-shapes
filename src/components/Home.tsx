import { Box } from '@mui/material';
import { useRef, useState } from 'react';
import { Config } from '../Config.ts';
import { PoseSystem } from '../mocap/PoseSystem.ts';
import { MeshView } from './MeshView.tsx';
import { VideoCamera, VideoConsumer } from './VideoCamera.tsx';
import { PerfPanel } from './PerfPanel.tsx';
import { Splash } from './Splash.tsx';

const Z_INDEX_CAMERA = 100;
const Z_INDEX_BESPOKE = 50;

const poseSystem = new PoseSystem();



const Home = ({ config }: { config: Config; }) => {
  const [showSplash, setShowSplash] = useState(true);
  const stickFigureCanvas = useRef<HTMLCanvasElement | null>(null);
  poseSystem.setConfig(config);

  const vc: VideoConsumer = {
    video: async (video: HTMLVideoElement, startTimeMs: number, _deltaMs: number): Promise<void> => {
      if (stickFigureCanvas.current) {
        if (showSplash) {
          setShowSplash(false);
        }
        poseSystem.justDraw(stickFigureCanvas.current, Z_INDEX_BESPOKE);
      }
      await poseSystem.detect(video, startTimeMs);
    }
  };
  const bespokeScale = config.mesh ? '50%' : '100%';
  const meshScale = config.bespoke ? '50%' : '100%';
  if (!config.bespoke && stickFigureCanvas.current) {
    poseSystem.resetCanvas();
  }
  return (
    <Box className="App-body" sx={{position: "absolute", alignContent: "center", justifyItems: "center", top: 0, left: 0, width: "100%", height: "100%"}}>
      <Splash visible={showSplash} />
      {config.diag && <PerfPanel poseSystem={poseSystem} />}
      {config.bespoke && <canvas ref={stickFigureCanvas} id="main_view"
              style={{ position: 'absolute', left: 0, top: 0, width: bespokeScale, height: bespokeScale }}></canvas>}
      <Box sx={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '50%',
        height: '50%',
        maxHeight: "50%",
        zIndex: Z_INDEX_CAMERA,
        visibility: config.camera ? 'visible' : 'hidden',
      }}>
        <VideoCamera consumers={[vc]} />
      </Box>
      {config.mesh && <MeshView
        sx={{position: 'absolute', left: 0, bottom: 0, width: meshScale, height: meshScale}}
        poseSupplier={poseSystem.subscribe}
        config={config}
      />}
    </Box>
  );
};

export default Home;
