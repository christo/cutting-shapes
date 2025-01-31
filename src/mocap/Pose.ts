import { SkeletalRotation } from './SkeletalRotation.ts';


export type PoseSupplier = () => Pose[];

/**
 * Project domain representation of body position.
 * Default position is canonical T-pose.
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