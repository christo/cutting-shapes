import {
  Color3,
  Color4,
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
import { Config } from '../Config.ts';
import { dumpMeshes, dumpSkeletons } from './ModelDebug.ts';
import { Pose, PoseSupplier } from './Pose.ts';
import { Puppet, PUPPETS } from './Puppet.ts';

export type SceneLoaded = {
  scene: Scene,
  loaderResult: ISceneLoaderAsyncResult
}

export async function loadPuppet(
  scene: Scene,
  puppet: Puppet,
  poseSupplier: () => Pose[],
  _config: Config): Promise<ISceneLoaderAsyncResult> {

  console.log(`loading puppet ${puppet.name}`);
  const result: ISceneLoaderAsyncResult = await SceneLoader.ImportMeshAsync(null, puppet.filepath, undefined, scene);
  dumpMeshes(result.meshes);
  const mesh = result.meshes[puppet.charMeshIdx];
  mesh.position.x = 0;
  mesh.position.y = 0;
  mesh.position.z = 0;
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
      console.error(`missing bone transform node(s), no rotations applied`);
    }

  }
  return result;
}

function babylonBgColor(config: Config) {
  if (config.bg === 'Black') {
    return new Color4(0, 0, 0, 1);
  } else if (config.bg === 'Green') {
    return new Color4(0, 1, 0, 1);
  } else if (config.bg === 'Blue') {
    return new Color4(0, 0, 1, 1);
  } else {
    // "Ghost" is transparent for this renderer
    return new Color4(0, 0, 0, 0);
  }
}

export const createScene = async function(
  engine: Engine,
  canvas: HTMLCanvasElement,
  poseSupplier: PoseSupplier,
  config: Config,
): Promise<SceneLoaded> {

  const scene = new Scene(engine);

  scene.clearColor = babylonBgColor(config);
  const camera = new FreeCamera('camera1', new Vector3(0, 1.3, 4), scene);
  camera.setTarget(new Vector3(0, 1, 0));
  camera.attachControl(canvas, true);
  const light = new HemisphericLight('light', new Vector3(0, 2, 2), scene);
  light.intensity = 0.6;

  if (config.ground) {
    const ground = MeshBuilder.CreateGround('ground', { width: 8, height: 8 }, scene);
    const groundMaterial = new StandardMaterial('Ground Material', scene);
    groundMaterial.diffuseColor = Color3.Green();
    ground.material = groundMaterial;
  }
  return {
    scene: scene,
    loaderResult: await loadPuppet(scene, PUPPETS[config.puppetIdx], poseSupplier, config),
  };
};