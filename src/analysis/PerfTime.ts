class PerfTime {
  static NULL: PerfTime = new PerfTime(NaN, NaN, NaN);
  msVisionTime: number;
  msRenderTime: number;
  msTransformTime: number;
  /** total poses that failed to render */
  renderErrors: number;

  constructor(msVisionTime: number, msRenderTime: number, msTransformTime: number, renderErrors: number = 0) {
    this.msVisionTime = msVisionTime;
    this.msRenderTime = msRenderTime;
    this.msTransformTime = msTransformTime;
    this.renderErrors = renderErrors;
  }

  ready() {
    return !(isNaN(this.msVisionTime) || isNaN(this.msRenderTime) || isNaN(this.msTransformTime));
  }
}

export { PerfTime };
