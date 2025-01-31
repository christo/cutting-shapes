import { DrawingUtils, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Body } from './Body.ts';
import { midPoint } from './Draw.ts';

export function drawCustomStickFigure(landmarks: NormalizedLandmark[][], ctx: CanvasRenderingContext2D, debugMode: boolean) {
  const noseIndex = Body.nose.valueOf();
  const leftEyeIndex = Body.left_eye.valueOf();
  const rightEyeIndex = Body.right_eye.valueOf();

  const sticks = [
    [Body.left_shoulder, Body.right_shoulder],

    [Body.left_shoulder, Body.left_elbow],
    [Body.right_shoulder, Body.right_elbow],
    [Body.left_elbow, Body.left_wrist],
    [Body.right_elbow, Body.right_wrist],

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
    [Body.left_ankle, Body.left_heel],
    [Body.right_ankle, Body.right_heel],
    [Body.left_heel, Body.left_foot_index],
    [Body.right_heel, Body.right_foot_index],

    [Body.left_shoulder, Body.right_hip],
    [Body.right_shoulder, Body.left_hip],
    // additional sticks between derived points are below
  ];

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

  const arc = (startX: number, startY: number, endX: number, endY: number, radiusFactor: number) => {

    // this is borked

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const radius = distance * radiusFactor;
    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;

    const startAngle = Math.atan2(startY - centerY, startX - centerX);
    const endAngle = Math.atan2(endY - centerY, endX - centerX);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
  };
  const canvasmirror = (l: NormalizedLandmark) => {
    return {
      x: ctx.canvas.width - (l.x * ctx.canvas.width),
      y: l.y * ctx.canvas.height,
      z: l.z,
      visibility: l.visibility,
    };
  };

  landmarks.forEach((ls, pi) => {
    if (debugMode) {
      ctx.font = '28px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`person ${pi + 1}`, 20, (pi + 2) * 20);
    }

    const canvasPoint = (part: number): NormalizedLandmark => {
      return canvasmirror(ls[part]);
    };
    // draw all sufficiently visible points
    ls.filter(l => l.visibility > 0.8).map(canvasmirror).forEach((l, i) => {

      const x = l.x;
      const y = l.y;
      ctx.lineWidth = 6;

      switch (i) {
        case noseIndex:
          ctx.fillStyle = 'red';
          spot(x, y, DrawingUtils.lerp(l.z, -0.15, 0.1, 15, 1));
          break;
        case leftEyeIndex:
          ctx.fillStyle = 'orange';
          spot(x, y, 10);
          break;
        case rightEyeIndex:
          ctx.fillStyle = 'orange';
          spot(x, y, 10);
          break;
        default:
          if (debugMode) {
            ctx.strokeStyle = 'blue';
            cross(x, y, 5);
          }
          break;
      }
    });

    // draw smiling mouth
    let mouthLeft = canvasPoint(Body.mouth_left);
    let mouthRight = canvasPoint(Body.mouth_right);
    if (mouthLeft.visibility > 0.6 && mouthRight.visibility > 0.6) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 4;
      arc(mouthRight.x, mouthRight.y, mouthLeft.x, mouthLeft.y, 0.6);
      arc(mouthRight.x, mouthRight.y, mouthLeft.x, mouthLeft.y, 0.8);
    }

    // draw stick figure
    ctx.lineWidth = 12;
    for (let i = 0; i < sticks.length; i++) {
      const pair = sticks[i];
      const p1 = canvasPoint(pair[0]);
      const p2 = canvasPoint(pair[1]);
      line(p1.x, p1.y, p2.x, p2.y);
    }
    // draw spine special case by joining hip and shoulder midpoints
    const leftShoulder = canvasPoint(Body.left_shoulder);
    const rightShoulder = canvasPoint(Body.right_shoulder);
    const leftHip = canvasPoint(Body.left_hip);
    const rightHip = canvasPoint(Body.right_hip);
    const neck = midPoint(leftShoulder, rightShoulder);
    const sacrum = midPoint(leftHip, rightHip);

    if (debugMode) {
      const leftEar = canvasPoint(Body.left_ear);
      const rightEar = canvasPoint(Body.right_ear);
      const midEar = midPoint(leftEar, rightEar);
      const nose = canvasPoint(Body.nose);
      // derived bones
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'white';
      line(leftEar.x, leftEar.y, rightEar.x, rightEar.y);
      line(neck.x, neck.y, sacrum.x, sacrum.y);
      line(neck.x, neck.y, midEar.x, midEar.y);
      line(midEar.x, midEar.y, nose.x, nose.y);
    }
  });
}