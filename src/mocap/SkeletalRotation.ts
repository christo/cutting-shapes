import { Vector3 } from '@babylonjs/core';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Rot, ROT_UNIT, ROT_ZERO } from '../analysis/Rot.ts';
import { Body } from './Body.ts';

// TODO implement max rotation extents per joint

const REST_HEAD_OFFSET: Rot = {
  pitch: -Math.PI / 3,
  yaw: -Math.PI / 12,
  roll: -1.1,
  // roll: -Math.PI / 2,
};

const REST_HEAD_SCALE: Rot = {
  pitch: 1,
  yaw: 1,
  roll: -1,
};

/**
 * Holds 3-axis rotations angles in radians for pairs of possibly
 * virtual bones. The angle is that formed from the reference bone
 * to the target bone.
 *
 *
 * foot/knee/hip/spine/neck/head
 * foot/knee/hip/spine/uparm/forearm/hand
 *
 */
export interface SkeletalRotation {

  /**
   * Joint angle formed from neck to head.
   */
  head: Rot;

  /**
   * Bone from mid hips to mid shoulders.
   */
  spine: Rot;

  /**
   * Bone from mid shoulders to mid head.
   */
  neck: Rot;

  // Arms
  leftShoulder: Rot;
  leftArm: Rot;
  leftForearm: Rot;
  rightShoulder: Rot;
  rightArm: Rot;
  rightForearm: Rot;

  // Legs
  leftUpLeg: Rot;
  leftLeg: Rot;
  leftFoot: Rot;
  rightUpLeg: Rot;
  rightLeg: Rot;
  rightFoot: Rot;
}

function v3(landmark: NormalizedLandmark): Vector3 {
  return new Vector3(landmark.x, landmark.y, landmark.z);
}


/**
 * Calculates the 3d rotation of a subject bone with respect to a connected reference bone.
 * e.g. calculate the rotation of the forearm at the elbow with shoulder, elbow, wrist.
 * @param startJoint start of reference bone
 * @param midJoint end of reference bone, start of subject bone
 * @param endJoint end of subject bone
 * @param offset optional constant offset Yaw,Pitch,Roll applied component-wise before scaling
 * @param scale optional scaling factor Yaw,Pitch,Roll applied component-wise after offset
 */
function calcBone(
  startJoint: Vector3,
  midJoint: Vector3,
  endJoint: Vector3,
  offset: Rot = ROT_ZERO,
  scale: Rot = ROT_UNIT,
): Rot {
  const refBone = midJoint.subtract(startJoint).normalize();
  const target = endJoint.subtract(midJoint).normalize();

  // Calculate yaw (around vertical axis)
  const yaw = Math.atan2(target.z, target.x) - Math.atan2(refBone.z, refBone.x);

  // Calculate pitch (around side-to-side axis)
  const pitch = Math.atan2(target.y,
      Math.sqrt(target.x * target.x + target.z * target.z)) -
    Math.atan2(refBone.y, Math.sqrt(refBone.x * refBone.x + refBone.z * refBone.z));

  // Calculate roll using cross product
  const cross = Vector3.Cross(refBone, target);
  const dot = Vector3.Dot(refBone, target);
  const roll = Math.atan2(cross.length(), dot);

  return {
    yaw: (yaw + offset.yaw) * scale.yaw,
    pitch: (pitch + offset.pitch) * scale.pitch,
    roll: (roll + offset.roll) * scale.roll,
  };
}

/**
 * Format a Vector3 with components of 2 decimal places
 * @param v3
 */
const v3f2 = (v3: Vector3): string => {
  return `x:${v3.x.toFixed(2)}, y:${v3.y.toFixed(2)}, z:${v3.z.toFixed(2)}`;
};

/**
 * Calculate the 3-axis rotation of the implied spine relative to the hips, given the locations of hips and shoulders.
 * Relative to t-pose, spinal rotations are around world axes as follows. Yaw: y-axis, roll: z-axis, pitch: x-axis.
 *
 * @param leftHip
 * @param rightHip
 * @param leftShoulder
 * @param rightShoulder
 */
export function calcSpine(leftHip: Vector3, rightHip: Vector3, leftShoulder: Vector3, rightShoulder: Vector3, debug: (msg: string) => void = _ => {}): Rot {
  // Get hip and shoulder lines (from left to right)
  const hipLine = rightHip.subtract(leftHip).normalize();
  const shoulderLine = rightShoulder.subtract(leftShoulder).normalize();

  debug(`hipLine: ${v3f2(hipLine)}`);
  debug(`shoulderLine: ${v3f2(shoulderLine)}`);

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
    rightShoulder.z - leftShoulder.z,
  ).length();

  const roll = -Math.atan2(verticalDiff, horizontalDist);

  return {
    pitch,
    yaw,
    roll,
  };
}

export function skeletalRotations(ls: NormalizedLandmark[], debug: (msg: string) => void = () =>{}): SkeletalRotation {
  // Convert key landmarks to Vector3
  const nose = v3(ls[Body.nose]);
  const leftEar = v3(ls[Body.left_ear]);
  const rightEar = v3(ls[Body.right_ear]);
  const leftShoulder = v3(ls[Body.left_shoulder]);
  const rightShoulder = v3(ls[Body.right_shoulder]);
  const leftElbow = v3(ls[Body.left_elbow]);
  const rightElbow = v3(ls[Body.right_elbow]);
  const leftWrist = v3(ls[Body.left_wrist]);
  const rightWrist = v3(ls[Body.right_wrist]);
  const leftHip = v3(ls[Body.left_hip]);
  const rightHip = v3(ls[Body.right_hip]);
  const leftKnee = v3(ls[Body.left_knee]);
  const rightKnee = v3(ls[Body.right_knee]);
  const leftAnkle = v3(ls[Body.left_ankle]);
  const rightAnkle = v3(ls[Body.right_ankle]);
  const leftFoot = v3(ls[Body.left_foot_index]);
  const rightFoot = v3(ls[Body.right_foot_index]);

  // reference mid points
  const midShoulder = Vector3.Center(leftShoulder, rightShoulder);
  const midHip = Vector3.Center(leftHip, rightHip);

  // const earsConfidence = ls[Body.left_ear].visibility + ls[Body.right_ear].visibility;
  // const outerEyesConfidence = ls[Body.left_eye_outer].visibility + ls[Body.right_eye_outer].visibility;
  // const innerEyesConfidence = ls[Body.left_eye_inner].visibility + ls[Body.right_eye_inner].visibility;
  // const eyeConfidence = ls[Body.left_eye].visibility + ls[Body.right_eye].visibility;

  const midEar = Vector3.Center(leftEar, rightEar);
  //const midEye = Vector3.Center(leftOuterEye, rightOuterEye);

  // TODO need to define joint rotation rest positions for t-pose
  return {
    // t-pose colinear vertical
    spine: calcSpine(leftHip, rightHip, leftShoulder, rightShoulder, debug),

    // t-pose: colinear vertical
    neck: calcBone(midHip, midShoulder, midEar), // TODO decide if required, currently unused

    // t-pose has a ~90 degree pitch offset because bone projects forward from middle of head through nose
    head: calcBone(midShoulder, midEar, nose, REST_HEAD_OFFSET, REST_HEAD_SCALE),

    // probably should be called upper arm
    leftShoulder: calcBone(midShoulder, leftShoulder, leftElbow),

    leftArm: calcBone(leftShoulder, leftElbow, leftWrist),

    // TODO looks wrong
    leftForearm: calcBone(leftElbow, leftWrist, leftWrist.add(leftWrist.subtract(leftElbow))),

    rightShoulder: calcBone(midShoulder, rightShoulder, rightElbow),

    rightArm: calcBone(rightShoulder, rightElbow, rightWrist),

    // TODO looks wrong
    rightForearm: calcBone(rightElbow, rightWrist, rightWrist.add(rightWrist.subtract(rightElbow))),

    leftUpLeg: calcBone(leftHip, leftKnee, leftAnkle),

    leftLeg: calcBone(leftKnee, leftAnkle, leftFoot),

    // TODO looks wrong
    leftFoot: calcBone(leftAnkle, leftFoot, leftFoot.add(new Vector3(0, -0.1, 0))),

    rightUpLeg: calcBone(rightHip, rightKnee, rightAnkle),

    rightLeg: calcBone(rightKnee, rightAnkle, rightFoot),

    // TODO looks wrong
    rightFoot: calcBone(rightAnkle, rightFoot, rightFoot.add(new Vector3(0, -0.1, 0))),
  };
}
