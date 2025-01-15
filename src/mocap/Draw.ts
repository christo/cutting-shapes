import {NormalizedLandmark} from "@mediapipe/tasks-vision";

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
}