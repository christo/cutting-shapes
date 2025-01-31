import { NormalizedLandmark } from '@mediapipe/tasks-vision';

/**
 * Calculates 3D midpoint with midpoint visibility as NormalizedLandmark.
 * @param a
 * @param b
 */
export const midPoint = (a: NormalizedLandmark, b: NormalizedLandmark): NormalizedLandmark => {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: (a.visibility + b.visibility) / 2,
  } as NormalizedLandmark;
};

/**
 * Linearly interpolate between the two points proportional to s (0-1)
 * @param s 0 means return a, 1 means return b, inbetween returns linear interpolation
 * @param a x/y/z/vis
 * @param b x/y/z/vis
 */
export const lerp = (s: number, a: NormalizedLandmark, b: NormalizedLandmark): NormalizedLandmark => {
  return {
    x: (b.x - a.x) * s + a.x,
    y: (b.y - a.y) * s + a.y,
    z: (b.z - a.z) * s + a.z,
    visibility: (b.visibility - a.visibility) * s + a.visibility,
  } as NormalizedLandmark;
};

