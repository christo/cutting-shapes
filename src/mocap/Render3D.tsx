import { Engine, ISceneLoaderAsyncResult, Scene } from '@babylonjs/core';

import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import '@babylonjs/loaders';
import { Config } from '../Config.ts';
import { createScene } from './Bab3dRenderer.ts';
import { PoseSupplier } from './Pose.ts';


interface Render3DProps {
  sx: any; // TODO what type should this be to pass to mui component?
  poseSupplier: PoseSupplier;
  config: Config;
}

/**
 * BabylonJs implementation of renderer
 * @param sx styles
 * @param poseSupplier provides poses
 * @param config sets options
 * @constructor
 */
export function Render3D({ sx, poseSupplier, config }: Render3DProps) {

  const renderCanvas = useRef<HTMLCanvasElement | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  // @ts-ignore TODO use loader result so puppets can be disposed and swapped dynamically
  const [loaderResult, setLoaderResult] = useState<ISceneLoaderAsyncResult | null>(null);
  useEffect(() => {
    if (renderCanvas.current) {
      console.log('renderCanvas is good, creating 3d scene');
      const canvas = renderCanvas.current;
π      const engine = new Engine(canvas, true);
      if (!scene) {
        createScene(engine, canvas, poseSupplier, config).then(sceneLoaded => {
          const scene = sceneLoaded.scene;
          setScene(scene);
          setLoaderResult(sceneLoaded.loaderResult);
          engine.runRenderLoop(() => {
            scene.render();
          });
        });
        window.addEventListener('resize', () => {
          // assumes scene canvas is proportional to window
          engine.resize();
        });π
      }
    }
  }, []);

  return <Box sx={sx}>
    <canvas ref={renderCanvas} style={{ width: '100%', height: '100%' }}></canvas>
  </Box>;
}

