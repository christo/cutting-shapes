import { Vector3 } from '@babylonjs/core';

type Rot = {
  pitch: number,
  yaw: number,
  roll: number
}

export function calcSpine(leftHip: Vector3, rightHip: Vector3, leftShoulder: Vector3, rightShoulder: Vector3): Rot {
  // Get hip and shoulder lines (from left to right)
  const hipLine = rightHip.subtract(leftHip).normalize();
  const shoulderLine = rightShoulder.subtract(leftShoulder).normalize();

  // Calculate spine vector (from hip center to shoulder center)
  const hipCenter = leftHip.add(rightHip).scale(0.5);
  const shoulderCenter = leftShoulder.add(rightShoulder).scale(0.5);
  const spineVector = shoulderCenter.subtract(hipCenter).normalize();

  // Calculate pitch (rotation around x-axis)
  const pitch = Math.asin(-spineVector.z);

  // Calculate yaw (rotation around y-axis / spine)
  // Project both vectors onto horizontal (x-z) plane and find angle
  const shoulderFlat = new Vector3(shoulderLine.x, 0, shoulderLine.z).normalize();
  const hipFlat = new Vector3(hipLine.x, 0, hipLine.z).normalize();
  const yaw = Math.atan2(shoulderFlat.z, shoulderFlat.x) - Math.atan2(hipFlat.z, hipFlat.x);

  // Calculate roll (rotation around z-axis)
  // Project shoulder vector onto plane perpendicular to spine
  // and measure its angle from horizontal
  const verticalDiff = rightShoulder.y - leftShoulder.y;
  const horizontalDist = new Vector3(
    rightShoulder.x - leftShoulder.x,
    0,
    rightShoulder.z - leftShoulder.z
  ).length();

  const roll = Math.atan2(verticalDiff, horizontalDist);

  return {
    pitch,
    yaw,
    roll
  };
}