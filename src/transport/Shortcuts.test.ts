import { describe, it } from 'bun:test';
import { expect } from 'chai';
import { keyToAction } from './Shortcuts.ts';

describe('shortcuts', () => {
  it('maps letter keys case-insensitively', () => {
    expect(keyToAction('r', 'liveIdle', false)).to.equal('record');
    expect(keyToAction('R', 'liveIdle', false)).to.equal('record');
    expect(keyToAction('L', 'filePlaying', false)).to.equal('live');
    expect(keyToAction('o', 'liveIdle', false)).to.equal('browse');
    expect(keyToAction('s', 'liveRecording', false)).to.equal('stop');
  });

  it('resolves play/pause toggle from mode', () => {
    for (const key of [' ', 'k', 'MediaPlayPause']) {
      expect(keyToAction(key, 'filePlaying', false), key).to.equal('pause');
      expect(keyToAction(key, 'filePaused', false), key).to.equal('play');
    }
  });

  it('maps media stop key', () => {
    expect(keyToAction('MediaStop', 'filePlaying', false)).to.equal('stop');
  });

  it('ignores modified and unmapped keys', () => {
    expect(keyToAction('r', 'liveIdle', true)).to.be.null;
    expect(keyToAction('x', 'liveIdle', false)).to.be.null;
    expect(keyToAction('Escape', 'liveIdle', false)).to.be.null;
  });
});
