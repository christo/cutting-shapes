/**
 * Ringbuffer that provides numeric aggregate functions.
 */
export class RingStat {
  private index: number;
  private readonly list: number[];
  private readonly size: number;

  constructor(size: number) {
    this.size = size;
    this.index = 0;
    this.list = [];
  }

  push(x: number) {
    this.index = (this.index + 1) % this.size;
    this.list[this.index] = x;
  }

  empty = () => this.list.length === 0;

  mean() {
    if (this.empty()) {
      return NaN;
    }
    let sum = 0;
    for (let i = 0; i < this.list.length; i++) {
      sum += this.list[i];
    }
    return sum / this.list.length;
  }

  max() {
    if (this.empty()) {
      return NaN;
    }
    return Math.max(...this.list)
  }

  min() {
    if (this.empty()) {
      return NaN;
    }
    return Math.min(...this.list)
  }
}