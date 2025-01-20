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
import { dumpMeshes, dumpSkeletons } from './ModelDebug.ts';
import { Pose, PoseSupplier } from './Pose.ts';
import { Puppet, PUPPETS } from './Puppet.ts';


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
    // depending on the mesh/skeleton, need to use TransformNode
    // TODO figure out determinant - when/if/always etc.
    const tn = bone.getTransformNode();
    if (tn) {
      scene.registerBeforeRender(function() {

        const poses1 = poses();
        if (poses1.length > 0) {
          const pose = poses1[0];
          const headRot = pose.skeletalRotation.head;
          // note rotation is ignored if rotationQuaternion is set
          // TODO confirm chirality, may need per-model sign flips in Puppet
          tn.rotation = new Vector3(headRot.pitch, headRot.yaw, headRot.roll);
        }
      });
    } else {
      // TODO maybe rotate the bone directly if there's no TransformNode?
      console.warn(`no transform node on bone ${bone.name}`);
    }

  }

}

interface Render3DProps {
  sx: any; // TODO what type should this be to pass to mui component?
  poseSupplier: PoseSupplier;
}

/**
 * BabylonJs implementation of renderer (WIP)
 * @param sx
 * @constructor
 */
export function Render3D({ sx, poseSupplier }: Render3DProps) {

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
        await loadPunter(scene, PUPPETS[punterIndex], poseSupplier);

        return scene;
      };
      if (!scene) {
        createScene().then(scene => {
          engine.runRenderLoop(() => {
            scene.render();
          });
        });
        setScene(scene);
        window.addEventListener('resize', () => {
          console.log('resizing 3d engine');
          // assumes scene canvas is proportional to window
          engine.resize();
        });
      }
    }
  }, []);

  return <Box sx={{ border: 'dotted purple thick', ...sx }}>
    <canvas ref={renderCanvas} width="600" height="400"></canvas>
  </Box>;
}

