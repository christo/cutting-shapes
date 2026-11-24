/**
 * Transport state machine for input source, recording and playback.
 *
 * TRANSITIONS is the single definition of behaviour: a button is enabled exactly when its action has a transition
 * from the current mode. Inputs with no transition are ignored.
 */

export const MODES = [
  'starting',
  'noCamera',
  'liveIdle',
  'liveRecording',
  'saving',
  'filePlaying',
  'filePaused',
] as const;
export type Mode = (typeof MODES)[number];

/**
 * User actions, each has a button and shortcut.
 */
export const ACTIONS = ['live', 'browse', 'record', 'play', 'pause', 'stop'] as const;
export type Action = (typeof ACTIONS)[number];

/**
 * System events, no button.
 */
export const EVENTS = ['cameraReady', 'cameraFailed', 'fileSelected', 'fileFailed', 'saved', 'saveFailed'] as const;
export type SystemEvent = (typeof EVENTS)[number];

export type Input = Action | SystemEvent;

export const INITIAL_MODE: Mode = 'starting';

// prettier-ignore
const TRANSITIONS: Record<Mode, Partial<Record<Input, Mode>>> = {
  // acquiring camera, splash shown, no controls
  starting:      { cameraReady: 'liveIdle', cameraFailed: 'noCamera' },
  // live retries camera
  noCamera:      { live: 'starting', browse: 'noCamera', fileSelected: 'filePlaying' },
  liveIdle:      { browse: 'liveIdle', fileSelected: 'filePlaying', record: 'liveRecording', cameraFailed: 'noCamera' },
  // source locked; losing camera saves what was recorded
  liveRecording: { stop: 'saving', cameraFailed: 'saving' },
  // all buttons disabled until server responds
  saving:        { saved: 'liveIdle', saveFailed: 'liveIdle' },
  // file loops so no ended mode; stop rewinds and pauses
  filePlaying:   { live: 'starting', browse: 'filePlaying', fileSelected: 'filePlaying', pause: 'filePaused', stop: 'filePaused', fileFailed: 'starting' },
  filePaused:    { live: 'starting', browse: 'filePaused', fileSelected: 'filePlaying', play: 'filePlaying', stop: 'filePaused', fileFailed: 'starting' },
};

export function enabled(mode: Mode, input: Input): boolean {
  return TRANSITIONS[mode][input] !== undefined;
}

/**
 * Next mode, or the same mode if input is not allowed.
 */
export function transition(mode: Mode, input: Input): Mode {
  return TRANSITIONS[mode][input] ?? mode;
}

export function isLive(mode: Mode): boolean {
  return mode === 'liveIdle' || mode === 'liveRecording';
}

export function isFile(mode: Mode): boolean {
  return mode === 'filePlaying' || mode === 'filePaused';
}
