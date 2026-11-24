import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Config } from '../Config.ts';
import { PoseSystem } from '../mocap/PoseSystem.ts';
import { MeshView } from './MeshView.tsx';
import { VideoCamera, VideoConsumer } from './VideoCamera.tsx';
import { PerfPanel } from './PerfPanel.tsx';
import { Splash } from './Splash.tsx';
import { RecordingBrowser } from './RecordingBrowser.tsx';
import { useTransport } from '../transport/useTransport.ts';

const Z_INDEX_CAMERA = 100;
const Z_INDEX_BESPOKE = 50;
export const Z_INDEX_SPLASH = 500;

const poseSystem = new PoseSystem();

const Home = ({ config }: { config: Config }) => {
  const [showSplash, setShowSplash] = useState(true);
  const stickFigureCanvas = useRef<HTMLCanvasElement | null>(null);
  const bespokeScale = config.mesh ? '50%' : '100%';
  const meshScale = config.bespoke ? '50%' : '100%';
  poseSystem.setConfig(config);
  const transport = useTransport();
  const vcs = useRef<VideoConsumer[]>([]);
  useEffect(() => {
    vcs.current[0] = {
      video: async (video: HTMLVideoElement, startTimeMs: number, _deltaMs: number): Promise<void> => {
        if (stickFigureCanvas.current) {
          // remove splash once we're live; no re-render once already false
          setShowSplash(false);
          poseSystem.justDraw(stickFigureCanvas.current, Z_INDEX_BESPOKE);
        }
        await poseSystem.detect(video, startTimeMs);
      },
    };
    // if the other is present, go half size

    if (!config.bespoke && stickFigureCanvas.current) {
      poseSystem.resetCanvas();
    }
  }, [config]);

  return (
    <Box
      className="App-body"
      sx={{
        position: 'absolute',
        alignContent: 'center',
        justifyItems: 'center',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      {config.diag && <PerfPanel poseSystem={poseSystem} />}
      {config.bespoke && (
        <canvas
          ref={stickFigureCanvas}
          id="main_view"
          style={{ position: 'absolute', left: 0, top: 0, width: bespokeScale, height: bespokeScale }}
        ></canvas>
      )}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '50%',
          height: '50%',
          maxHeight: '50%',
          display: 'flex',
          justifyContent: 'end',
          zIndex: Z_INDEX_CAMERA,
          visibility: config.camera ? 'visible' : 'hidden',
        }}
      >
        <VideoCamera
          consumers={vcs.current}
          source={transport.source}
          videoRef={transport.videoRef}
          onError={transport.onVideoError}
        />
      </Box>
      {config.mesh && (
        <MeshView
          sx={{ position: 'absolute', left: 0, bottom: 0, width: meshScale, height: meshScale }}
          poseSupplier={poseSystem.subscribe}
          config={config}
        />
      )}
      <Splash visible={showSplash} />
      <RecordingBrowser open={transport.browsing} onClose={transport.closeBrowser} onSelect={transport.selectFile} />
    </Box>
  );
};

export default Home;
