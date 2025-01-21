export interface Rot {
  yaw: number;
  pitch: number;
  roll: number;
}

export const ROT_ZERO: Rot = { yaw: 0, pitch: 0, roll: 0 };
export const ROT_UNIT: Rot = { yaw: 1, pitch: 1, roll: 1 };