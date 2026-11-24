import { Action, enabled, Mode } from './Transport.ts';

const PLAY_PAUSE = 'playPause';
type Shortcut = Action | typeof PLAY_PAUSE;

/**
 * Keys by KeyboardEvent.key, single characters lower case.
 */
export const SHORTCUTS: Record<string, Shortcut> = {
  l: 'live',
  o: 'browse',
  r: 'record',
  s: 'stop',
  ' ': PLAY_PAUSE,
  k: PLAY_PAUSE,
  MediaPlayPause: PLAY_PAUSE,
  MediaStop: 'stop',
};

/**
 * Action for a key press in the given mode, or null if unmapped or modified (leaves e.g. cmd-r reload alone).
 */
export function keyToAction(key: string, mode: Mode, modified: boolean): Action | null {
  if (modified) {
    return null;
  }
  const shortcut = SHORTCUTS[key.length === 1 ? key.toLowerCase() : key];
  if (shortcut === PLAY_PAUSE) {
    return enabled(mode, 'pause') ? 'pause' : 'play';
  }
  return shortcut ?? null;
}
