export type Bg = "Black" | "Green" | "Blue" | "Playlist";

export const BgValues: Bg[] = ["Black", "Green", "Blue", "Playlist"];

export class Config {
  /**
   * Whether to show debug info.
   */
  debug: boolean = false;
  /**
   * Whether to show performance data like frames per second, updates per second etc.
   */
  perf: boolean = false;
  bg: Bg = "Black";
  camera: boolean = false;
}