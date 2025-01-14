import {
  DrawingUtils,
  FilesetResolver,
  NormalizedLandmark,
  PoseLandmarker,
  PoseLandmarkerResult
} from "@mediapipe/tasks-vision";

type RunningMode = "IMAGE" | "VIDEO";

// @ts-ignore
function drawDefaultLandmarkers(result: PoseLandmarkerResult, ctx: CanvasRenderingContext2D) {
  const drawingUtils = new DrawingUtils(ctx);
  for (const landmark of result.landmarks) {
    drawingUtils.drawLandmarks(landmark, {
      // make the closer node dots bigger
      radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
      fillColor: "orange",
      color: "yellow"
    });
    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
      lineWidth: 5,
      color: "yellow"
    });
  }
}

function drawCustomStickFigure(result: PoseLandmarkerResult, ctx: CanvasRenderingContext2D) {
  const noseIndex = BODY.nose.valueOf();
  const leftEyeIndex = BODY.left_eye.valueOf();
  const rightEyeIndex = BODY.right_eye.valueOf();

  const sticks = [
    [BODY.left_shoulder, BODY.right_shoulder],

    [BODY.left_shoulder, BODY.left_elbow],
    [BODY.right_shoulder, BODY.right_elbow],
    [BODY.left_elbow, BODY.left_wrist],
    [BODY.right_elbow, BODY.right_wrist],

    [BODY.left_wrist, BODY.left_thumb],
    [BODY.right_wrist, BODY.right_thumb],
    [BODY.left_thumb, BODY.left_index],
    [BODY.right_thumb, BODY.right_index],
    [BODY.left_index, BODY.left_pinky],
    [BODY.right_index, BODY.right_pinky],
    [BODY.left_pinky, BODY.left_wrist],
    [BODY.right_pinky, BODY.right_wrist],

    [BODY.left_hip, BODY.right_hip],
    [BODY.left_hip, BODY.left_knee],
    [BODY.right_hip, BODY.right_knee],
    [BODY.left_knee, BODY.left_ankle],
    [BODY.right_knee, BODY.right_ankle],
    [BODY.left_ankle, BODY.left_heel],
    [BODY.right_ankle, BODY.right_heel],
    [BODY.left_heel, BODY.left_foot_index],
    [BODY.right_heel, BODY.right_foot_index],

    [BODY.left_shoulder, BODY.right_hip],
    [BODY.right_shoulder, BODY.left_hip],
    // additional sticks between derived points are below
  ];

  const line = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const spot = (x: number, y: number, radius: number) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  const cross = (x: number, y: number, size: number) => {
    line(x - size, y - size, x + size, y + size);
    line(x + size, y - size, x - size, y + size);
  }

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
  }
  const canvasmirror = (l: NormalizedLandmark) => {
    return {
      x: ctx.canvas.width-(l.x * ctx.canvas.width),
      y: l.y * ctx.canvas.height,
      z: l.z,
      visibility: l.visibility,
    }
  }

  const midPoint = (a: NormalizedLandmark, b: NormalizedLandmark): NormalizedLandmark => {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      z: (a.z + b.z) / 2,
      visibility: (a.visibility + b.visibility) / 2,
    } as NormalizedLandmark;
  }
  result.landmarks.forEach((ls, pi) => {
        ctx.font = '28px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`person ${pi+1}`, 20, (pi + 2) * 20);
        const canvasPoint = (part: BODY): NormalizedLandmark => {
          return canvasmirror(ls[part.valueOf()]);
        }
        // draw all points
        ls.filter(l => l.visibility > 0.8).map(canvasmirror).forEach((l, i) => {

          const x = l.x;
          const y = l.y;
          ctx.lineWidth = 6;

          switch (i) {
            case noseIndex:
              ctx.fillStyle = "red";
              spot(x, y, DrawingUtils.lerp(l.z, -0.15, 0.1, 15, 1));
              break;
            case leftEyeIndex:
              ctx.fillStyle = "orange";
              spot(x, y, 10);
              break;
            case rightEyeIndex:
              ctx.fillStyle = "orange";
              spot(x, y, 10);
              break;
            default:
              ctx.strokeStyle = "blue";
              cross(x, y, 5)
              break
          }
        });

        // draw smiling mouth
        let mouthLeft = canvasPoint(BODY.mouth_left);
        let mouthRight = canvasPoint(BODY.mouth_right);
        if (mouthLeft.visibility > 0.6 && mouthRight.visibility > 0.6) {
          ctx.strokeStyle = "red";
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
          line(p1.x, p1.y , p2.x, p2.y);
        }
        // draw spine special case
        const leftShoulder = canvasPoint(BODY.left_shoulder);
        const rightShoulder = canvasPoint(BODY.right_shoulder);
        const leftHip = canvasPoint(BODY.left_hip);
        const rightHip = canvasPoint(BODY.right_hip);
        const neck = midPoint(leftShoulder, rightShoulder);
        const sacrum = midPoint(leftHip, rightHip);
        line(neck.x , neck.y , sacrum.x , sacrum.y );
      });
}

/**
 * Component responsible for low-latency client-side image analysis to find people in the camera-field
 */
class PoseSystem {

  /**
   * WasmFileset that holds GPU or CPU inference bundle. Accessed through {@link #getVision()}
   */
  private vision: any;
  private canvas: HTMLCanvasElement | null = null;
  private poseLandmarker: PoseLandmarker | null = null;

  /**
   * Gets body poses from 1 or two people
   * @param numPoses the maximum number of people to detect
   * @param runningMode
   */
  async getPose(numPoses: 1 | 2 = 1, runningMode: RunningMode = "VIDEO"): Promise<PoseLandmarker> {
    if (!this.poseLandmarker) {
      console.log("creating pose landmarker")
      this.poseLandmarker = await PoseLandmarker.createFromOptions(await this.getVision(), {
        baseOptions: {
          modelAssetPath: `/models/pose_landmarker_heavy.task`,
          delegate: "GPU"
        },
        runningMode: runningMode,
        numPoses: numPoses
      });
    }
    if (this.poseLandmarker) {
      return this.poseLandmarker;
    } else {
      console.warn("no poseLandmarker");
      return Promise.reject("No Pose Landmarker");
    }
  }

  /**
   * Draw landmarks as a registered overlay canvas over the given canvas at the given zIndex.
   * If the zIndex is lower than that of the canvas it will not be above!
   * Does not attach to the given canv if already created. To reattach, call resetCanvas() first.
   * TODO: maybe automatically draw at +1 of the zIndex of canv?
   */
  async drawLandmarks(source: TexImageSource, timestamp: number, dest: HTMLCanvasElement, zIndex: number) {
    if (!this.canvas) {
      // lazy init canvas
      console.log("lazy init drawing canvas");
      dest.parentNode!.appendChild(this.overlayCanvas(dest, zIndex));
    }
    if (this.canvas) {
      // clear
      const ctx = this.canvas.getContext('2d', {
        willReadFrequently: false
      })!;
      // Draw something initially
      ctx!.fillStyle = "rgba(0, 0, 0, 0.2)"; // echo ghosts
      ctx!.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const plm = await this.getPose(2, "VIDEO");
      plm.detectForVideo(source, timestamp, (result: PoseLandmarkerResult) => {
        // drawDefaultLandmarkers(result, ctx);
        drawCustomStickFigure(result, ctx);
      });
    } else {
      console.warn("PoseSystem has no canvas?");
    }
  }

  /**
   * Removes any previously attached canvas element and attempts to free up resources used.
   */
  resetCanvas() {
    if (this.canvas) {
      this.canvas.remove();
    }
  }

  /**
   * Internal lazy-initialising getter for the vision WasmFileset.
   * @private
   */
  private async getVision() {
    if (!this.vision) {
      console.log("Vision system loading");
      this.vision = await FilesetResolver.forVisionTasks("/node_modules/@mediapipe/tasks-vision/wasm");
    }
    return this.vision;
  }

  /**
   * Precisely fits a new canvas element on the given element.
   * @param image
   * @param zIndex the z-height of the created canvas
   * @private
   */
  private overlayCanvas(canv: HTMLCanvasElement, zIndex: number) {
    this.canvas = document.createElement("canvas") as HTMLCanvasElement;
    this.canvas.setAttribute("class", "canvas");
    const bounds = canv.getBoundingClientRect();
    this.canvas.setAttribute("width", bounds.width * 2 + "px");
    this.canvas.setAttribute("height", bounds.height * 2 + "px");
    const refStyle = canv.computedStyleMap();
    this.canvas.setAttribute("style", `position: absolute;
        left: ${refStyle.get("left")};
        top: ${refStyle.get("top")};
        width: ${refStyle.get("width")};
        height: ${refStyle.get("height")};
        transform: ${refStyle.get("transform")};
        z-index: ${zIndex};
        object-fit: ${refStyle.get("object-fit")};
        object-position: ${refStyle.get("object-position")};`)
    return this.canvas;
  }
}

enum BODY {
  nose,
  left_eye_inner,
  left_eye,
  left_eye_outer,
  right_eye_inner,
  right_eye,
  right_eye_outer,
  left_ear,
  right_ear,
  mouth_left,
  mouth_right,
  left_shoulder,
  right_shoulder,
  left_elbow,
  right_elbow,
  left_wrist,
  right_wrist,
  left_pinky,
  right_pinky,
  left_index,
  right_index,
  left_thumb,
  right_thumb,
  left_hip,
  right_hip,
  left_knee,
  right_knee,
  left_ankle,
  right_ankle,
  left_heel,
  right_heel,
  left_foot_index,
  right_foot_index,
}

export {PoseSystem};