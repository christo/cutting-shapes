import { Vector3 } from '@babylonjs/core';
import { expect } from 'chai';
import { calcSpine } from './SkeletalRotation.ts';

const EPSILON = 0.001;
const expectEpsilon = (actual: number, expected: number, message: string) => {
  expect(actual).to.be.approximately(expected, EPSILON, message);
}

/**
 * t -pose in xy plane, spine on y axis
 * hips same width as shoulders
 */
const T_POSE = {
  lHip: new Vector3(-1, 0, 0),
  rHip: new Vector3(1, 0, 0),
  lShoulder: new Vector3(-1, 1, 0),
  rShoulder: new Vector3(1, 1, 0),
};

const debug = console.log;

describe("Spine", () => {
  const tSpine = calcSpine(T_POSE.lHip, T_POSE.rHip, T_POSE.lShoulder, T_POSE.rShoulder, debug);
  it("t-pose pitch", () => {
    expectEpsilon(tSpine.pitch, 0, "t-pose spine should have zero pitch");
  });
  it("t-pose yaw", () => {
    expectEpsilon(tSpine.yaw, 0, "t-pose spine should have zero yaw");
  });
  it("t-pose roll", () => {
    expectEpsilon(tSpine.roll, 0, "t-pose spine should have zero roll");
  });
  describe("45 degree y-axis twist left", () => {
    const lShoulder = new Vector3(-1, 1, 1); // left shoulder out of screen
    const rShoulder = new Vector3(1, 1, -1); // right shoulder into screen
    // shoulder x-extent = z-extent = 2 with spine on y-axis
    // should mean PI/4 yaw but zero pitch and roll
    const twistSpine = calcSpine(T_POSE.lHip, T_POSE.rHip, lShoulder, rShoulder, debug);
    it("twisted yaw", () => {
      expectEpsilon(twistSpine.yaw, -Math.PI/4, "should be 45 degree twist");
    });
    it("zero pitch", () => {
      expectEpsilon(twistSpine.pitch, 0, "y-axis twist should have no pitch");
    });
    it("zero roll", () => {
      expectEpsilon(twistSpine.roll, 0, "y-axis twist should have no roll");
    });
  });
  it('should calculate roll for tilted shoulders', () => {
    const leftHip = new Vector3(-1, 0, 0);
    const rightHip = new Vector3(1, 0, 0);
    const leftShoulder = new Vector3(-1, 0, 0);   // lowered shoulder
    const rightShoulder = new Vector3(1, 2, 0);   // raised shoulder

    const rotation = calcSpine(leftHip, rightHip, leftShoulder, rightShoulder, debug);

    expect(Math.abs(rotation.roll)).to.be.approximately(Math.PI/4, 0.0001);
    expect(rotation.pitch).to.be.approximately(0, 0.0001);
    expect(rotation.yaw).to.be.approximately(0, 0.0001);
  });
});

describe('Spine Rotation Calculations', () => {
  it('should correctly calculate yaw for y-axis rotation with no pitch or roll', () => {
    const leftHip = new Vector3(-1, 0, 0);
    const rightHip = new Vector3(1, 0, 0);
    const leftShoulder = new Vector3(-1, 1, 1);
    const rightShoulder = new Vector3(1, 1, -1);

    const rotation = calcSpine(leftHip, rightHip, leftShoulder, rightShoulder, debug);

    // For this configuration, we expect:
    // - Yaw to be Math.PI/4 (or -Math.PI/4 depending on convention)
    // - Pitch and Roll to be 0
    expect(Math.abs(rotation.yaw)).to.be.approximately(Math.PI/4, 0.0001);
    expect(rotation.pitch).to.be.approximately(0, 0.0001);
    expect(rotation.roll).to.be.approximately(0, 0.0001);
  });

  it('should calculate zero rotations for aligned spine', () => {
    const leftHip = new Vector3(-1, 0, 0);
    const rightHip = new Vector3(1, 0, 0);
    const leftShoulder = new Vector3(-1, 1, 0);
    const rightShoulder = new Vector3(1, 1, 0);

    const rotation = calcSpine(leftHip, rightHip, leftShoulder, rightShoulder, debug);

    expect(rotation.yaw).to.be.approximately(0, 0.0001);
    expect(rotation.pitch).to.be.approximately(0, 0.0001);
    expect(rotation.roll).to.be.approximately(0, 0.0001);
  });
});