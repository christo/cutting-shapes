export interface Rot {
  pitch: number;
  yaw: number;
  roll: number;
}

export interface DebugRot extends Rot {
  debug: string[],
}

export const ROT_ZERO: Rot = { yaw: 0, pitch: 0, roll: 0 };
export const ROT_UNIT: Rot = { yaw: 1, pitch: 1, roll: 1 };