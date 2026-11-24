import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { expect } from 'chai';
import { Config } from '../Config.ts';
import { PoseSystem } from './PoseSystem.ts';

const N_LANDMARKS = 33;

function person(x: number): NormalizedLandmark[] {
  return Array.from({ length: N_LANDMARKS }, (_, i) => ({ x, y: i / N_LANDMARKS, z: 0, visibility: 1 }));
}

/**
 * Feeds frames through processLandmarks as detect() does, returning the final stored landmarks.
 */
function run(smoothing: number, frames: NormalizedLandmark[][][]): NormalizedLandmark[][] {
  const ps = new PoseSystem();
  const config = new Config();
  config.smoothing = smoothing;
  ps.setConfig(config);
  let prev: NormalizedLandmark[][] = [];
  for (const frame of frames) {
    prev = ps.processLandmarks(frame);
    // processLandmarks reads the private previous-frame state that detect() normally sets
    (ps as unknown as { prevLandmarks: NormalizedLandmark[][] }).prevLandmarks = prev;
  }
  return prev;
}

describe('PoseSystem.processLandmarks', () => {
  it('returns no poses for an empty frame', () => {
    expect(run(0, [[]])).to.deep.equal([]);
    expect(run(0.5, [[]])).to.deep.equal([]);
  });

  it('recovers a person after an empty frame with smoothing on', () => {
    const result = run(0.5, [[], [person(0.5)], [person(0.5)]]);
    expect(result).to.have.length(1);
    expect(result[0]).to.have.length(N_LANDMARKS);
  });

  it('smooths towards the previous frame', () => {
    const result = run(0.5, [[person(0)], [person(1)]]);
    expect(result[0][0].x).to.equal(0.5);
  });

  it('keeps current landmarks missing from the previous frame', () => {
    const partial = person(0).slice(0, 10);
    const result = run(0.5, [[partial], [person(1)]]);
    expect(result[0]).to.have.length(N_LANDMARKS);
    expect(result[0][0].x).to.equal(0.5);
    expect(result[0][N_LANDMARKS - 1].x).to.equal(1);
  });

  it('does not alias input landmarks', () => {
    const input = [person(1)];
    const result = run(0, [input]);
    result[0][0].x = 99;
    expect(input[0][0].x).to.equal(1);
  });
});
