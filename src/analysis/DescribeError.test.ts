import { describe, it } from 'bun:test';
import { expect } from 'chai';
import { describeError } from './DescribeError.ts';

function errorWithStack(stack: string): Error {
  const e = new TypeError("Cannot read properties of undefined (reading 'x')");
  e.stack = stack;
  return e;
}

describe('describeError', () => {
  it('uses the top frame of a Chrome stack', () => {
    const e = errorWithStack(
      "TypeError: Cannot read properties of undefined (reading 'x')\n" +
        '    at canvasmirror (http://localhost:5173/src/mocap/BespokeRenderer.ts:121:12)\n' +
        '    at canvasPoint (http://localhost:5173/src/mocap/BespokeRenderer.ts:135:16)',
    );
    expect(describeError(e)).to.equal(
      "TypeError: Cannot read properties of undefined (reading 'x') at canvasmirror (src/mocap/BespokeRenderer.ts:121:12)",
    );
  });
  it('uses the top frame of a Firefox stack', () => {
    const e = errorWithStack('canvasmirror@http://localhost:5173/src/mocap/BespokeRenderer.ts:121:12\n');
    expect(describeError(e)).to.equal(
      "TypeError: Cannot read properties of undefined (reading 'x') canvasmirror@src/mocap/BespokeRenderer.ts:121:12",
    );
  });
  it('falls back to the message without a stack', () => {
    const e = new RangeError('bad');
    e.stack = undefined;
    expect(describeError(e)).to.equal('RangeError: bad');
  });
  it('stringifies non-errors', () => {
    expect(describeError('boom')).to.equal('boom');
  });
});
