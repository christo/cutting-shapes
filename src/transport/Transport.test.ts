import { describe, it } from 'bun:test';
import { expect } from 'chai';
import { Action, ACTIONS, enabled, EVENTS, Input, INITIAL_MODE, Mode, MODES, transition } from './Transport.ts';

// requirements restated independently of the implementation table
const ENABLED_BUTTONS: Record<Mode, Action[]> = {
  starting: [],
  noCamera: ['live', 'browse'],
  liveIdle: ['browse', 'record'],
  liveRecording: ['stop'],
  saving: [],
  filePlaying: ['live', 'browse', 'pause', 'stop'],
  filePaused: ['live', 'browse', 'play', 'stop'],
};

describe('transport', () => {
  for (const mode of MODES) {
    it(`enables exactly ${ENABLED_BUTTONS[mode].join(', ') || 'nothing'} in ${mode}`, () => {
      const actual = ACTIONS.filter((a) => enabled(mode, a));
      expect(actual).to.have.members(ENABLED_BUTTONS[mode]);
    });
  }

  it('never records from a file', () => {
    expect(enabled('filePlaying', 'record')).to.be.false;
    expect(enabled('filePaused', 'record')).to.be.false;
  });

  it('records then saves back to live', () => {
    const path: [Input, Mode][] = [
      ['cameraReady', 'liveIdle'],
      ['record', 'liveRecording'],
      ['stop', 'saving'],
      ['saved', 'liveIdle'],
    ];
    let mode = INITIAL_MODE;
    for (const [input, expected] of path) {
      mode = transition(mode, input);
      expect(mode, input).to.equal(expected);
    }
  });

  it('saves when camera lost while recording', () => {
    expect(transition('liveRecording', 'cameraFailed')).to.equal('saving');
  });

  it('returns to live after failed save', () => {
    expect(transition('saving', 'saveFailed')).to.equal('liveIdle');
  });

  it('plays, pauses, stops and switches files', () => {
    expect(transition('liveIdle', 'fileSelected')).to.equal('filePlaying');
    expect(transition('filePlaying', 'pause')).to.equal('filePaused');
    expect(transition('filePaused', 'play')).to.equal('filePlaying');
    expect(transition('filePlaying', 'stop')).to.equal('filePaused');
    expect(transition('filePaused', 'fileSelected')).to.equal('filePlaying');
  });

  it('leaves file for live via camera start', () => {
    expect(transition('filePlaying', 'live')).to.equal('starting');
    expect(transition('filePlaying', 'fileFailed')).to.equal('starting');
  });

  it('falls back to file browsing without a camera', () => {
    expect(transition('starting', 'cameraFailed')).to.equal('noCamera');
    expect(transition('noCamera', 'fileSelected')).to.equal('filePlaying');
    expect(transition('noCamera', 'live')).to.equal('starting');
  });

  it('ignores disallowed input', () => {
    expect(transition('saving', 'record')).to.equal('saving');
    expect(transition('liveRecording', 'fileSelected')).to.equal('liveRecording');
  });

  it('reaches every mode from initial', () => {
    const inputs: Input[] = [...ACTIONS, ...EVENTS];
    const seen = new Set<Mode>([INITIAL_MODE]);
    const queue: Mode[] = [INITIAL_MODE];
    while (queue.length) {
      const mode = queue.shift()!;
      for (const input of inputs) {
        const next = transition(mode, input);
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    expect([...seen]).to.have.members([...MODES]);
  });
});
