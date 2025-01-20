
/**
 * Project domain representation of body position.
 * Default position is canonical T-pose.
 */
export class Pose {
  headRotX: number;
  headRotY: number;
  headRotZ: number;

  constructor(headRotX: number, headRotY: number, headRotZ: number) {
    this.headRotX = headRotX;
    this.headRotY = headRotY;
    this.headRotZ = headRotZ;
  }
}