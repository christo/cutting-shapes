import {DrawingUtils, FilesetResolver, PoseLandmarker, PoseLandmarkerResult} from "@mediapipe/tasks-vision";
import {drawCustomStickFigure} from "./StickFigure.ts";

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
  private debugMode: boolean = true;

  setDebugMode(debugMode: boolean) {
    this.debugMode = debugMode;
  }

  /**
   * Gets body poses with trained model, running on GPU
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
        drawCustomStickFigure(result, ctx, this.debugMode);
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
      console.log("Vision system loaded");
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

export {PoseSystem};