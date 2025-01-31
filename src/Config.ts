export type Bg = "Black" | "Green" | "Blue" | "Ghost";

export const BgValues: Bg[] = ["Black", "Green", "Blue", "Ghost"];

/**
 * Primary application configuration struct.
 */
export class Config {
  static MAX_SMOOTHING: number = 0.999;

  puppetIdx: number = 0;

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
   * How much motion smoothing - coefficient between 0 (no smoothing) and 1 (max smoothing).
   */
  smoothing: number = 0;

  /**
   * Whether or not to show the ground in the puppet renderer.
   */
  ground: boolean = false;

  /**
   * Whether to use inverse kinematics (true) or skeletal rotation calculations for 3d pose.
   */
  ik: boolean = false;

  /**
   * Whether to render the 3d mesh puppet.
   */
  mesh: boolean = true;

  /**
   * Whether to show the hand-rendered figure
   */
  bespoke = true;

}