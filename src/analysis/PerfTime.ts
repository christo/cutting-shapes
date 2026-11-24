class PerfTime {
  static NULL: PerfTime = new PerfTime(NaN, NaN, NaN);
  msVisionTime: number;
  msRenderTime: number;
  msTransformTime: number;
  /** total poses that failed to render */
  renderErrors: number;
  /** description of the most recent render failure, empty if none */
  lastRenderError: string;

  constructor(
    msVisionTime: number,
    msRenderTime: number,
    msTransformTime: number,
    renderErrors: number = 0,
    lastRenderError: string = '',
  ) {
    this.msVisionTime = msVisionTime;
    this.msRenderTime = msRenderTime;
    this.msTransformTime = msTransformTime;
    this.renderErrors = renderErrors;
    this.lastRenderError = lastRenderError;
  }

  ready() {
    return !(isNaN(this.msVisionTime) || isNaN(this.msRenderTime) || isNaN(this.msTransformTime));
  }
}

export { PerfTime };
