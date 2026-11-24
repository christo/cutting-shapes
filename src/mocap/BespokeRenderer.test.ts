import { describe, it } from 'bun:test';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { expect } from 'chai';
import { Config } from '../Config.ts';
import { drawCustomStickFigure } from './BespokeRenderer.ts';

const N_LANDMARKS = 33;
const N_PARTIAL = 10;

const person = (): NormalizedLandmark[] =>
  Array.from({ length: N_LANDMARKS }, (_, i) => ({ x: 0.5, y: i / N_LANDMARKS, z: 0, visibility: 1 }));

/**
 * Canvas context stub: every method is a no-op, every property assignable.
 */
function stubCtx(): CanvasRenderingContext2D {
  const noop = () => {};
  return new Proxy({ canvas: { width: 1920, height: 1080 } } as Record<string | symbol, unknown>, {
    get: (target, key) => (key in target ? target[key] : noop),
    set: () => true,
  }) as unknown as CanvasRenderingContext2D;
}

const draw = (poses: NormalizedLandmark[][]) => drawCustomStickFigure(poses, stubCtx(), new Config());

describe('drawCustomStickFigure failure count', () => {
  it('is zero with nobody in view', () => {
    expect(draw([])).to.equal(0);
  });
  it('is zero for complete poses', () => {
    expect(draw([person(), person()])).to.equal(0);
  });
  it('counts each pose missing landmarks', () => {
    const partial = person().slice(0, N_PARTIAL);
    expect(draw([person(), partial, []])).to.equal(2);
  });
});
