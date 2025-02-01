import { SkeletalRotation } from './SkeletalRotation.ts';


export type PoseSupplier = () => Pose[];

/**
 * Project domain representation of a single body position.
 * Default position is canonical T-pose, skeletal rotations are hierarchical bone-relative deltas from t-pose.
 */
export class Pose {
  skeletalRotation: SkeletalRotation;
  descriptor: string[];

  // TODO integrate positional reference anchor in view

  constructor(skeletalRotation: SkeletalRotation, descriptor: string[] = []) {
    this.skeletalRotation = skeletalRotation;
    this.descriptor = descriptor;
  }

}