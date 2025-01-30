import {
  Axis,
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
import { Config } from '../Config.ts';
import { dumpMeshes, dumpSkeletons } from './ModelDebug.ts';
import { Pose, PoseSupplier } from './Pose.ts';
import { Puppet, PUPPETS } from './Puppet.ts';

let puppetIdx = 0;

async function loadPuppet(scene: Scene, puppet: Puppet, poseSupplier: () => Pose[]): Promise<ISceneLoaderAsyncResult> {
  console.log('loading puppet');
  const result: ISceneLoaderAsyncResult = await SceneLoader.ImportMeshAsync(null, puppet.filepath, undefined, scene);
  // console.log(puppet.name);
  dumpMeshes(result.meshes);
  const mesh = result.meshes[puppet.charMeshIdx];
  mesh.position.x = 0;
  mesh.position.y = 0;
  mesh.position.z = 0;
  mesh.rotate(Axis.Y, Math.PI); // face camera
  puppet.postLoad(result);

  console.log(`${result.skeletons.length} skeletons`);
  dumpSkeletons(result.skeletons);

  const skeleton = (result.skeletons.length === 0) ?
    result.meshes[puppet.charMeshIdx].skeleton :
    result.skeletons[0];
  if (skeleton) {
    skeleton.returnToRest();
  }
  // stop default animation (0) if it exists
  if (result.animationGroups.length > 0) {
    result.animationGroups[0].stop();
  }
  if (skeleton) {
    let headBone = skeleton.bones[skeleton.getBoneIndexByName(puppet.boneMap.head.name)];
    let spineBone = skeleton.bones[skeleton.getBoneIndexByName(puppet.boneMap.spine.name)];
    const xHead = headBone.getTransformNode();
    const xSpine = spineBone.getTransformNode();
    if (xHead && xSpine) {
      scene.registerBeforeRender(function() {

        const poses = poseSupplier();
        if (poses.length > 0) {
          // TODO handle all poses with additional puppets
          const pose = poses[0];
          const headRot = pose.skeletalRotation.head;
          const spineRot = pose.skeletalRotation.spine;
          // note rotation is ignored if rotationQuaternion is set
          // TODO confirm chirality, may need per-puppet sign flips
          xHead.rotation = new Vector3(headRot.pitch, headRot.yaw, headRot.roll);
          xSpine.rotation = new Vector3(spineRot.pitch, spineRot.yaw, spineRot.roll);
          // tn.rotation = new Vector3(0, headRot.yaw, 0);
        }
      });
    } else {
      // TODO maybe rotate the bone directly if there's no TransformNode?
      console.warn(`missing bone transform node(s)`);
    }

  }
  return result;
}

interface Render3DProps {
  sx: any; // TODO what type should this be to pass to mui component?
  poseSupplier: PoseSupplier;
  config: Config;
}

/**
 * BabylonJs implementation of renderer
 * @param sx
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
      const createScene = async function() {
        const scene = new Scene(engine);
        const camera = new FreeCamera('camera1', new Vector3(0, 1.3, -4), scene);
        camera.setTarget(new Vector3(0, 1, 0));
        camera.attachControl(canvas, true);
        const light = new HemisphericLight('light', new Vector3(0, 2, -2), scene);
        light.intensity = 0.6;

        if (config.ground) {
          const ground = MeshBuilder.CreateGround('ground', { width: 8, height: 8 }, scene);
          const groundMaterial = new StandardMaterial('Ground Material', scene);
          groundMaterial.diffuseColor = Color3.Purple();
          ground.material = groundMaterial;
        }
        // TODO keep return value in state so puppets can be disposed and swapped
        await loadPuppet(scene, PUPPETS[puppetIdx], poseSupplier);
        return scene;
      };
      if (!scene) {
        createScene().then(scene => {
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

