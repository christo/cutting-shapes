import { Vector3 } from '@babylonjs/core';

type Rot = {
  pitch: number,
  yaw: number,
  roll: number
}

export function calcSpine(leftHip: Vector3, rightHip: Vector3, leftShoulder: Vector3, rightShoulder: Vector3): Rot {
  // Calculate shoulder and hip vectors (from left to right)
  const shoulderVector = rightShoulder.subtract(leftShoulder).normalize();
  const hipVector = rightHip.subtract(leftHip).normalize();

  // Calculate spine vector (from hip center to shoulder center)
  const hipCenter = leftHip.add(rightHip).scale(0.5);
  const shoulderCenter = leftShoulder.add(rightShoulder).scale(0.5);
  const spineVector = shoulderCenter.subtract(hipCenter).normalize();

  // Calculate pitch (forward/backward tilt)
  const pitch = Math.asin(-spineVector.z);

  // Calculate yaw (rotation around vertical axis)
  // Project both vectors onto horizontal (x-z) plane
  const shoulderVectorFlat = new Vector3(shoulderVector.x, 0, shoulderVector.z).normalize();
  const hipVectorFlat = new Vector3(hipVector.x, 0, hipVector.z).normalize();

  const yaw = Math.atan2(
    Vector3.Dot(Vector3.Cross(hipVectorFlat, shoulderVectorFlat), Vector3.Up()),
    Vector3.Dot(hipVectorFlat, shoulderVectorFlat)
  );

  // Calculate roll (twist around spine axis)
  // Project both shoulder and hip vectors onto plane perpendicular to spine
  const spineProjection = Vector3.Dot(shoulderVector, spineVector);
  const projectedShoulderVector = shoulderVector
    .subtract(spineVector.scale(spineProjection))
    .normalize();

  const hipProjection = Vector3.Dot(hipVector, spineVector);
  const projectedHipVector = hipVector
    .subtract(spineVector.scale(hipProjection))
    .normalize();

  // Calculate roll as angle between projected vectors
  const roll = Math.atan2(
    Vector3.Dot(Vector3.Cross(projectedHipVector, projectedShoulderVector), spineVector),
    Vector3.Dot(projectedHipVector, projectedShoulderVector)
  );

  return {
    pitch,
    yaw,
    roll
  };
}