export type Bg = "Black" | "Green" | "Blue" | "Ghost";

export const BgValues: Bg[] = ["Black", "Green", "Blue", "Ghost"];

/**
 * Primary application configuration struct.
 */
export class Config {

  /**
   * Whether to show debug info.
   */
  debug: boolean = false;

  /**
   * Whether to show performance data like frames per second, updates per second etc.
   */
  diag: boolean = false;

  /**
   * Background to render.
   */
  bg: Bg = "Black";

  /**
   * Whether to show video input source.
   */
  camera: boolean = false;

  /**
   * Input source: true = live camera, false = video playback.
   * Input source drives motion capture.
   */
  live: boolean = true;

  /**
   * Whether or not to do motion smoothing.
   */
  smoothing: boolean = false;

  /**
   * Whether or not to show the ground in the puppet renderer.
   */
  ground: boolean = false;
}