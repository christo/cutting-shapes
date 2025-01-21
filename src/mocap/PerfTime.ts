class PerfTime {
  static NULL: PerfTime = new PerfTime(NaN, NaN, NaN);
  msVisionTime: number;
  msRenderTime: number;
  msTransformTime: number;

  constructor(msVisionTime: number, msRenderTime: number, msTransformTime: number) {
    this.msVisionTime = msVisionTime;
    this.msRenderTime = msRenderTime;
    this.msTransformTime = msTransformTime;
  }

  ready() {
    return !(isNaN(this.msVisionTime) || isNaN(this.msRenderTime) || isNaN(this.msTransformTime));
  }
}

export { PerfTime };