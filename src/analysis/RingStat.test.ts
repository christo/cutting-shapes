import { expect } from 'chai';
import { RingStat } from './RingStat.ts';

describe('RingStat', () => {
  it('is NaN when empty', () => {
    expect(new RingStat(3).mean()).to.be.NaN;
  });
  it('aggregates before the buffer wraps', () => {
    const r = new RingStat(100);
    r.push(5);
    r.push(7);
    expect(r.mean()).to.equal(6);
    expect(r.min()).to.equal(5);
    expect(r.max()).to.equal(7);
  });
  it('drops oldest values after wrapping', () => {
    const r = new RingStat(2);
    [1, 2, 3].forEach(x => r.push(x));
    expect(r.mean()).to.equal(2.5);
    expect(r.min()).to.equal(2);
  });
});
