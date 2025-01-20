class PerfTime {
  static NULL: PerfTime = new PerfTime(NaN, NaN, NaN);
  msVisionTime: number;
  msRenderTime: number;
  msUpdateTime: number;

  constructor(msVisionTime: number, msRenderTime: number, msUpdateTime: number) {
    this.msVisionTime = msVisionTime;
    this.msRenderTime = msRenderTime;
    this.msUpdateTime = msUpdateTime;
  }

  ready() {
    return !(isNaN(this.msVisionTime) || isNaN(this.msRenderTime) || isNaN(this.msUpdateTime));
  }
}

export { PerfTime };