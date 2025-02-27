import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { midPoint } from '../analysis/Draw.ts';
import { Config } from '../Config.ts';
import { Body } from './Body.ts';

const DRAW_NECK = false;
const DRAW_FACE_BG = true;

// simple stick connection pairs
const sticks = [
  [Body.left_shoulder, Body.right_shoulder],

  [Body.left_shoulder, Body.left_elbow],
  [Body.right_shoulder, Body.right_elbow],
  [Body.left_elbow, Body.left_wrist],
  [Body.right_elbow, Body.right_wrist],

  // hands
  [Body.left_wrist, Body.left_thumb],
  [Body.right_wrist, Body.right_thumb],
  [Body.left_thumb, Body.left_index],
  [Body.right_thumb, Body.right_index],
  [Body.left_index, Body.left_pinky],
  [Body.right_index, Body.right_pinky],
  [Body.left_pinky, Body.left_wrist],
  [Body.right_pinky, Body.right_wrist],

  [Body.left_hip, Body.right_hip],
  [Body.left_hip, Body.left_knee],
  [Body.right_hip, Body.right_knee],
  [Body.left_knee, Body.left_ankle],
  [Body.right_knee, Body.right_ankle],

  // feet
  [Body.left_ankle, Body.left_heel],
  [Body.right_ankle, Body.right_heel],
  [Body.left_heel, Body.left_foot_index],
  [Body.right_heel, Body.right_foot_index],
  [Body.left_ankle, Body.left_foot_index],
  [Body.right_ankle, Body.right_foot_index],

  [Body.left_shoulder, Body.right_hip],
  [Body.right_shoulder, Body.left_hip],

  // additional sticks between derived points are below
];

const ballJoints = [
  Body.left_shoulder,
  Body.right_shoulder,
  Body.left_elbow,
  Body.right_elbow,
  Body.left_hip,
  Body.right_hip,
  Body.left_knee,
  Body.right_knee,
  Body.left_ankle,
  Body.right_ankle,
  // Body.left_wrist, Body.right_wrist,
];

function bgColour(config: Config) {
  if (config.bg === 'Ghost') {
    // return 'transparent';
    return 'rgb(0, 0, 0)'; // internal ghost effect needs black for erasure
  } else if (config.bg === 'Green') {
    return 'rgb(0, 255, 0)';
  } else if (config.bg === 'Blue') {
    return 'rgb(0, 0, 255)';
  } else if (config.bg === 'Black') {
    return 'rgb(0, 0, 0)';
  } else {
    return config.bg;
  } // shouldn't happen
}

function timeHue(msPeriod: number): string {
  const now = Date.now();
  const hue = (now % msPeriod) / msPeriod * 360;
  return `hsl(${hue}, 50%, 65%)`;
}

export function drawCustomStickFigure(
  landmarks: NormalizedLandmark[][],
  ctx: CanvasRenderingContext2D,
  config: Config,
) {
  // TODO z-scaling with lerp

  const bg = bgColour(config);

  // maintains line drawing scale based on canvas width
  // currently, expected deployment resolution is 1920x1080
  const drawScale = (x: number) => {
    return Math.max(3, (x * ctx.canvas.width) / 4000);
  };

  const faceLineWidth = drawScale(120);
  const boneWidth = drawScale(30);
  // noinspection JSUnusedLocalSymbols
  const neckWidth = drawScale(50);
  const glassesWidth = drawScale(70);
  const noseWidth = drawScale(40);
  const mouthWidth = drawScale(18);
  const noseShadowWidth = drawScale(6);
  const debugLineWidth = drawScale(3);
  const jointRadius = drawScale(40);

  let boneStyle = 'rgb(255, 255, 255)';
  const cycle = new Date().getMinutes() % 10;
  if (cycle == 0) {
    boneStyle = timeHue(500);
  } else if (cycle > 3) {
    boneStyle = `rgb(255, ${cycle*30}, 0)`;
  }

  const ballStyle = boneStyle;
  const faceStyle = 'rgb(0, 0, 0)';
  const debugLineStyle = 'white';
  const debugPointStyle = 'blue';
  const debugPointCrossSize = drawScale(10);

  const line = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const spot = (x: number, y: number, radius: number) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const cross = (x: number, y: number, size: number) => {
    line(x - size, y - size, x + size, y + size);
    line(x + size, y - size, x - size, y + size);
  };

  /**
   * Return coordinates flipped over y axis scaled to canvas.
   * @param l the landmark to transform
   */
  const canvasmirror = (l: NormalizedLandmark) => {
    return {
      x: ctx.canvas.width - l.x * ctx.canvas.width,
      y: l.y * ctx.canvas.height,
      z: l.z,
      visibility: l.visibility,
    };
  };

  landmarks.forEach((ls, pi) => {
    try {

      // TODO if we can't get all the parts, we probably can't draw this frame

      const canvasPoint = (part: number): NormalizedLandmark => {
        return canvasmirror(ls[part]);
      };

      // construct implied joints
      const leftShoulder = canvasPoint(Body.left_shoulder);
      const rightShoulder = canvasPoint(Body.right_shoulder);
      const leftHip = canvasPoint(Body.left_hip);
      const rightHip = canvasPoint(Body.right_hip);
      const neck = midPoint(leftShoulder, rightShoulder);
      const sacrum = midPoint(leftHip, rightHip);
      const leftEar = canvasPoint(Body.left_ear);
      const rightEar = canvasPoint(Body.right_ear);
      const midEar = midPoint(leftEar, rightEar);
      const leftEye = canvasPoint(Body.left_eye);
      const rightEye = canvasPoint(Body.right_eye);
      const midEye = midPoint(leftEye, rightEye);
      const leftOuterEye = canvasPoint(Body.left_eye_outer);
      const rightOuterEye = canvasPoint(Body.right_eye_outer);
      const mouthLeft = canvasPoint(Body.mouth_left);
      const mouthRight = canvasPoint(Body.mouth_right);
      const nose = canvasPoint(Body.nose);
      const midMouth = midPoint(mouthLeft, mouthRight);
      const noseBase = midPoint(midMouth, midEye);
      const nostrilBase = midPoint(noseBase, nose);

      // neck
      if (DRAW_NECK) {
        ctx.lineWidth = neckWidth;
        // TODO maybe extend neck by 50%
        line(neck.x, neck.y, midEar.x, midEar.y);
      }

      // draw defined sticks
      ctx.lineWidth = boneWidth;
      for (let i = 0; i < sticks.length; i++) {
        const pair = sticks[i];
        const p1 = canvasPoint(pair[0]);
        const p2 = canvasPoint(pair[1]);
        line(p1.x, p1.y, p2.x, p2.y);
      }
      // neck
      if (DRAW_NECK) {
        // TODO maybe extend by 50% and make fatter
        ctx.lineWidth = neckWidth;
        line(neck.x, neck.y, midEar.x, midEar.y);

      }

      // draw ball joints
      ctx.fillStyle = ballStyle;
      for (let i = 0; i < ballJoints.length; i++) {
        const bj = canvasPoint(ballJoints[i]);
        spot(bj.x, bj.y, jointRadius);
      }
      //spot(neck.x, neck.y, jointRadius); // neck balljoint


      // draw face

      // face background
      if (DRAW_FACE_BG) {

        ctx.lineWidth = faceLineWidth;
        ctx.strokeStyle = faceStyle;
        ctx.fillStyle = faceStyle;
        ctx.lineCap = 'square'; // TODO check corners
        ctx.lineJoin = 'round';

        // eye/mouth mask
        ctx.beginPath();
        ctx.moveTo(leftOuterEye.x, leftOuterEye.y);
        ctx.lineTo(rightOuterEye.x, rightOuterEye.y);
        ctx.lineTo(mouthRight.x, mouthRight.y);
        ctx.lineTo(mouthLeft.x, mouthLeft.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // ear/mouth mask
        ctx.beginPath();
        ctx.moveTo(leftEar.x, leftEar.y);
        ctx.lineTo(rightEar.x, rightEar.y);
        ctx.lineTo(mouthRight.x, mouthRight.y);
        ctx.lineTo(mouthLeft.x, mouthLeft.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // ear/eye mask
        ctx.beginPath();
        ctx.moveTo(leftEar.x, leftEar.y);
        ctx.lineTo(rightEar.x, rightEar.y);
        ctx.lineTo(rightOuterEye.x, rightOuterEye.y);
        ctx.lineTo(leftOuterEye.x, leftOuterEye.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      }

      // sunglasses:
      ctx.lineWidth = glassesWidth;
      ctx.strokeStyle = boneStyle;
      ctx.lineCap = 'square';
      line(leftOuterEye.x, leftOuterEye.y, rightOuterEye.x, rightOuterEye.y);
      // sunglasses nose notch
      ctx.lineCap = 'round';
      ctx.strokeStyle = faceStyle;
      ctx.lineWidth = noseWidth;
      ctx.beginPath();
      ctx.moveTo(nose.x, nose.y);
      ctx.lineTo(midEye.x, midEye.y);
      ctx.lineTo(noseBase.x, noseBase.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      line(nose.x, nose.y, midEye.x, midEye.y);

      // nose shadow line
      ctx.strokeStyle = boneStyle;
      ctx.lineWidth = noseShadowWidth;
      ctx.lineCap = 'butt';
      line(nose.x, nose.y, nostrilBase.x, nostrilBase.y);

      ctx.strokeStyle = boneStyle;
      ctx.lineCap = 'round';
      // mouth
      if (mouthLeft.visibility > 0.6 && mouthRight.visibility > 0.6) {
        ctx.lineWidth = mouthWidth;
        line(mouthRight.x, mouthRight.y, mouthLeft.x, mouthLeft.y);
        // arc(mouthRight.x, mouthRight.y, mouthLeft.x, mouthLeft.y, 2.1);
      }

      // draw debug overlay
      if (config.debug) {
        ctx.font = '28px Arial';
        ctx.fillStyle = debugLineStyle;
        ctx.fillText(`human ${pi + 1}`, 20, (pi + 2) * 20);

        // derived bones
        ctx.lineWidth = debugLineWidth;
        ctx.strokeStyle = debugLineStyle;
        // ears lateral
        line(leftEar.x, leftEar.y, rightEar.x, rightEar.y);
        // spine
        line(neck.x, neck.y, sacrum.x, sacrum.y);
        // neck
        line(neck.x, neck.y, midEar.x, midEar.y);
        // head ventral (mid head to nose)
        line(midEar.x, midEar.y, nose.x, nose.y);

        ctx.strokeStyle = debugPointStyle;
        ctx.lineWidth = debugLineWidth;
        for (let i = 0; i < ls.length; i++) {
          if (ls[i].visibility > 0.8) {
            const l = canvasmirror(ls[i]);
            cross(l.x, l.y, debugPointCrossSize);
          }
        }
      }
    } catch (e) {
      console.log(`pose ${pi} asplode: ${e}`);
      // any problem with a single pose means we do not render it
    }
  });
}
