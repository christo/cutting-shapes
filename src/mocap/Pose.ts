import { SkeletalRotation } from './SkeletalRotation.ts';


export type PoseSupplier = () => Pose[];

/**
 * Project domain representation of body position.
 * Default position is canonical T-pose.
 */
export class Pose {
  skeletalRotation: SkeletalRotation;

  // TODO may need to integrate joint position in case skeletal rotation is crazy

  constructor(skeletalRotation: SkeletalRotation) {
    this.skeletalRotation = skeletalRotation;
  }
}