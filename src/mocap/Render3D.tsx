import {
  Color3,
  Engine,
  FreeCamera,
  HemisphericLight,
  ISceneLoaderAsyncResult,
  MeshBuilder,
  Scene,
  SceneLoader,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import '@babylonjs/loaders';
import { Pose } from './Pose.ts';
import { Puppet, PUPPETS } from './Puppet.ts';
import { dumpMeshes, dumpSkeletons } from './ModelDebug.ts';


let punterIndex = 0;

async function loadPunter(scene: Scene, model: Puppet, poses: () => Pose[]) {
  console.log('loading puppet');
  const result: ISceneLoaderAsyncResult = await SceneLoader.ImportMeshAsync(null, model.filepath, undefined, scene);
  // console.log(puppet.name);
  dumpMeshes(result.meshes);
  const puppet = result.meshes[0];
  model.postLoad(result);
  puppet.showBoundingBox = true;
  puppet.position.x = 0;
  puppet.position.y = 0;
  puppet.position.z = 0;
  console.log(`${result.skeletons.length} skeletons`);
  dumpSkeletons(result.skeletons);
  const skeleton = result.skeletons[0];
  skeleton.returnToRest();
  // stop default animation (0) if it exists
  if (result.animationGroups.length > 0) {
    result.animationGroups[0].stop();
  }
  if (skeleton) {
    let bone = skeleton.bones[model.headIdx];
    const tn = bone.getTransformNode();
    if (tn) {
      scene.registerBeforeRender(function() {
        const pose = poses()[0];
        tn.rotation = new Vector3(pose.headRotX, pose.headRotY, pose.headRotZ);
      });
    }

  }

}

interface Render3DProps {
  sx: any; // TODO what type should this be to pass to mui component?
  poses: () => Pose[];
}

/**
 * BabylonJs implementation of renderer (WIP)
 * @param sx
 * @constructor
 */
export function Render3D({ sx, poses }: Render3DProps) {

  const renderCanvas = useRef<HTMLCanvasElement | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  useEffect(() => {
    if (renderCanvas.current) {
      console.log('effect: rendercanvas good, setting up 3d scene');
      const canvas = renderCanvas.current;
      const engine = new Engine(canvas, true);
      const createScene = async function() {
        const scene = new Scene(engine);
        const camera = new FreeCamera('camera1', new Vector3(0, 1.3, -4), scene);
        camera.setTarget(new Vector3(0, 1, 0));
        camera.attachControl(canvas, true);
        const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;
        const ground = MeshBuilder.CreateGround('ground', { width: 8, height: 8 }, scene);
        const groundMaterial = new StandardMaterial('Ground Material', scene);
        groundMaterial.diffuseColor = Color3.Purple();
        ground.material = groundMaterial;
        await loadPunter(scene, PUPPETS[punterIndex], poses);

        return scene;
      };
      if (!scene) {
        createScene().then(scene => {
          engine.runRenderLoop(() => {

            // try updating positions here
            //const fatGuy = scene.meshes.find(mesh => mesh.name === 'char-fat-man-type-1');
            //randomBoneRotations(fatGuy!);
            scene.render();
          });
        });
        setScene(scene);
        window.addEventListener('resize', () => {
          console.log('resizing 3d engine');
          engine.resize();
        });
      }
    }
  }, []);

  return <Box sx={{ border: 'dotted purple thick', ...sx }}>
    <canvas ref={renderCanvas} width="600" height="400"></canvas>
  </Box>;
}

