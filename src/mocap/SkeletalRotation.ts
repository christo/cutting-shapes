import { Vector3 } from '@babylonjs/core';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Body } from './Body.ts';
import { Rot, ROT_UNIT, ROT_ZERO } from '../geometry/la.ts';

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

function calculateSpineRotation(
  leftHip: Vector3,
  rightHip: Vector3,
  leftShoulder: Vector3,
  rightShoulder: Vector3,
): Rot {
  // Calculate hip and shoulder centres
  const hipCentre = Vector3.Center(leftHip, rightHip);
  const shoulderCentre = Vector3.Center(leftShoulder, rightShoulder);

  // Get hip orientation (cross product of hip line and up vector gives forward direction)
  const hipRight = rightHip.subtract(leftHip).normalize();
  const up = new Vector3(0, 1, 0);
  const hipForward = Vector3.Cross(hipRight, up).normalize();

  // Calculate spine direction
  const spineDir = shoulderCentre.subtract(hipCentre).normalize();

  // Project spine onto hip-relative planes for rotation calculations
  const spineHorizontal = new Vector3(spineDir.x, 0, spineDir.z).normalize();

  // Calculate twist by comparing shoulder orientation to hip orientation
  const shoulderRight = rightShoulder.subtract(leftShoulder).normalize();
  const projectedShoulderRight = new Vector3(shoulderRight.x, 0, shoulderRight.z).normalize();

  // Yaw (rotation around vertical axis) - compare to hip forward
  const yaw = Math.atan2(spineHorizontal.z, spineHorizontal.x) - Math.atan2(hipForward.z, hipForward.x);

  // Pitch (forward/backward lean) - angle from vertical
  const pitch = Math.atan2(spineDir.y, Math.sqrt(spineDir.x * spineDir.x + spineDir.z * spineDir.z));

  // Roll (twist) - compare shoulder orientation to hip orientation
  const roll = Math.atan2(projectedShoulderRight.z, projectedShoulderRight.x) -
    Math.atan2(hipRight.z, hipRight.x);

  return { yaw, pitch: pitch + Math.PI / 2.8, roll };
}

export function skeletalRotations(ls: NormalizedLandmark[]): SkeletalRotation {
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
    // t-pose colinear
    spine: calculateSpineRotation(leftHip, rightHip, leftShoulder, rightShoulder),

    // t-pose: colinear
    neck: calcBone(midHip, midShoulder, midEar),

    // t-pose has a ~90 degree pitch offset
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

// Helper function to convert rotations to BabylonJS Euler angles
export function convertToBabylonRotation(rot: Rot): Vector3 {
  return new Vector3(rot.pitch, rot.yaw, rot.roll);
}