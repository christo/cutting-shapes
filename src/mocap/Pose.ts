import { SkeletalRotation } from './SkeletalRotation.ts';


export type PoseSupplier = () => Pose[];

/**
 * Project domain representation of body position.
 * Default position is canonical T-pose.
 */
export class Pose {
  skeletalRotation: SkeletalRotation;

  // TODO integrate foot position for ground anchor

  constructor(skeletalRotation: SkeletalRotation) {
    this.skeletalRotation = skeletalRotation;
  }
}