import { Axis, ISceneLoaderAsyncResult, Scene, SceneLoader, Vector3 } from '@babylonjs/core';
import { dumpMeshes, dumpSkeletons } from './ModelDebug.ts';
import { Pose } from './Pose.ts';
import { Puppet } from './Puppet.ts';

export async function loadPuppet(scene: Scene, puppet: Puppet, poseSupplier: () => Pose[]): Promise<ISceneLoaderAsyncResult> {
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