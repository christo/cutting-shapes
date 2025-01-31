import {
  Color3,
  Engine,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import '@babylonjs/loaders';
import { Config } from '../Config.ts';
import { loadPuppet } from './Bab3dRenderer.ts';
import { PoseSupplier } from './Pose.ts';
import { PUPPETS } from './Puppet.ts';


const createScene = async function(engine: Engine, canvas: HTMLCanvasElement, poseSupplier: PoseSupplier, config: Config) {
  const newScene = new Scene(engine);
  const camera = new FreeCamera('camera1', new Vector3(0, 1.3, -4), newScene);
  camera.setTarget(new Vector3(0, 1, 0));
  camera.attachControl(canvas, true);
  const light = new HemisphericLight('light', new Vector3(0, 2, -2), newScene);
  light.intensity = 0.6;

  if (config.ground) {
    const ground = MeshBuilder.CreateGround('ground', { width: 8, height: 8 }, newScene);
    const groundMaterial = new StandardMaterial('Ground Material', newScene);
    groundMaterial.diffuseColor = Color3.Purple();
    ground.material = groundMaterial;
  }
  // TODO keep return value in state so puppets can be disposed and swapped
  await loadPuppet(newScene, PUPPETS[config.puppetIdx], poseSupplier);
  return newScene;
};


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
  useEffect(() => {
    if (renderCanvas.current) {
      console.log('renderCanvas is good, creating 3d scene');
      const canvas = renderCanvas.current;

      const engine = new Engine(canvas, true);
      if (!scene) {
        createScene(engine, canvas, poseSupplier, config).then(scene => {
          setScene(scene);
          engine.runRenderLoop(() => {
            scene.render();
          });
        });
        window.addEventListener('resize', () => {
          // assumes scene canvas is proportional to window
          engine.resize();
        });
      }
    }
  }, []);

  return <Box sx={sx}>
    <canvas ref={renderCanvas} style={{ width: '100%', height: '100%' }}></canvas>
  </Box>;
}

