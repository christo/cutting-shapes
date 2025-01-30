import { Rot } from './Rot.ts';
import { RingStat } from './RingStat.ts';

/**
 * Ring buffer of {@link Rot} with aggregate functions.
 */
class RotRingStat {
  private pitch: RingStat;
  private yaw: RingStat;
  private roll: RingStat;

  constructor(size: number) {
    this.pitch = new RingStat(size);
    this.yaw = new RingStat(size);
    this.roll = new RingStat(size);
  }

  // TODO review this api for components based on preferred callsite usage

  push(rot: Rot) {
    this.pitch.push(rot.pitch);
    this.yaw.push(rot.yaw);
    this.roll.push(rot.roll);
  }

  mean(): Rot {
    return {
      pitch: this.pitch.mean(),
      yaw: this.yaw.mean(),
      roll: this.roll.mean(),
    }
  }

  min(): Rot {
    return {
      pitch: this.pitch.min(),
      yaw: this.yaw.min(),
      roll: this.roll.min(),
    }
  }

  max(): Rot {
    return {
      pitch: this.pitch.max(),
      yaw: this.yaw.max(),
      roll: this.roll.max(),
    }
  }

}