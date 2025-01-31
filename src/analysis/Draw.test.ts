import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { expect } from 'chai';
import { lerp, midPoint } from './Draw.ts';


function visible(x: number, y: number, z: number): NormalizedLandmark {
  return {
    x: x,
    y: y,
    z: z,
    visibility: 1,
  };
}

describe('midpoint', () => {
  it('works for positive domain', () => {
    const nl1 = visible(1, 1, 1);
    const nl2 = visible(3, 3, 3);
    const expected: NormalizedLandmark = visible(2, 2, 2);
    expect(midPoint(nl1, nl2)).to.deep.equal(expected);
    expect(midPoint(nl2, nl1)).to.deep.equal(expected);
  });
  it('works for partial negative domain', () => {
    const nl1 = visible(-1, 1, 1);
    const nl2 = visible(3, 3, 3);
    const expected = visible(1, 2, 2);
    expect(midPoint(nl1, nl2)).to.deep.equal(expected);
    expect(midPoint(nl2, nl1)).to.deep.equal(expected);
  });
  it('works for negative domain', () => {
    const nl1 = visible(-1, -1, -1);
    const nl2 = visible(-3, -3, -3);
    const expected: NormalizedLandmark = visible(-2, -2, -2);
    expect(midPoint(nl1, nl2)).to.deep.equal(expected);
    expect(midPoint(nl2, nl1)).to.deep.equal(expected);
  });
});

describe('lerp', () => {
  it('works for midpoint', () => {
    const nl1 = visible(1, 1, 1);
    const nl2 = visible(3, 3, 3);
    const expected: NormalizedLandmark = visible(2, 2, 2);
    expect(lerp(0.5, nl1, nl2)).to.deep.equal(expected);
    expect(lerp(0.5, nl2, nl1)).to.deep.equal(expected);
  });
  it('works for boundaries', () => {
    const nl1 = visible(10, 10, 10);
    const nl2 = visible(110, 110, 110);
    expect(lerp(0, nl1, nl2)).to.deep.equal(nl1);
    expect(lerp(1, nl1, nl2)).to.deep.equal(nl2);
  });
  it('works for 10%', () => {
    const nl1 = visible(10, 10, 10);
    const nl2 = visible(110, 110, 110);
    const expected: NormalizedLandmark = visible(20, 20, 20);
    expect(lerp(0.1, nl1, nl2)).to.deep.equal(expected);
    expect(lerp(0.9, nl2, nl1)).to.deep.equal(expected);
  });
});