import {
  DrawingUtils,
  FilesetResolver,
  NormalizedLandmark,
  PoseLandmarker,
  PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { Config } from '../Config.ts';
import { Body } from './Body.ts';
import { midPoint } from './Draw.ts';
import { PerfTime } from './PerfTime.ts';
import { Pose } from './Pose.ts';
import { RingStat } from './RingStat.ts';
import { drawCustomStickFigure } from './StickFigure.ts';

type RunningMode = 'IMAGE' | 'VIDEO';

// @ts-ignore
function drawDefaultLandmarkers(result: PoseLandmarkerResult, ctx: CanvasRenderingContext2D) {
  const drawingUtils = new DrawingUtils(ctx);
  for (const landmark of result.landmarks) {
    drawingUtils.drawLandmarks(landmark, {
      // make the closer node dots bigger
      radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
      fillColor: 'orange',
      color: 'yellow',
    });
    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
      lineWidth: 5,
      color: 'yellow',
    });
  }
}

function cloneLandmarks(nlss: NormalizedLandmark[][]): NormalizedLandmark[][] {
  return nlss.map((nls): NormalizedLandmark[] => nls.map(nl => ({ ...nl })));
}

/**
 * Canonical comparison for detected poses in the form of
 * @param a
 * @param b
 */
const compareNlss = (a: NormalizedLandmark[], b:NormalizedLandmark[]) => {
  // guessing most likely visible landmark is a shoulder
  // x position preferred in camera field because gravity
  // future: empirical evidence from reference video of most useful way to distinguish people
  return a[Body.left_shoulder].x - b[Body.left_shoulder].x;
}

/**
 * In place canonical reordering to impose inter-frame stability.
 * @param nlss
 */
function sortPeople(nlss: NormalizedLandmark[][]) {
  nlss.sort(compareNlss)
}

/**
 * Component responsible for low-latency client-side image analysis to find people in the camera-field
 */
class PoseSystem {

  private msVisionTime: RingStat = new RingStat(100);
  private msRenderTime: RingStat = new RingStat(100);
  private msUpdateTime: RingStat = new RingStat(100);

  /**
   * Historic storage for subscribers and calculating smoothed motion.
   * future: consider kalman filtering, prediction and configurable histeresis
   * @private
   */
  private prevLandmarks: NormalizedLandmark[][] = [];

  /**
   * True iff pose cache invalid.
   */
  private poseCacheDirty: boolean = true;

  /**
   * Calculated from landmarks. Each pose corresponds to a person, canonically ordered by
   * landmark sorting.
   * @private
   */
  private poseCache: Pose[] = [];

  /**
   * WasmFileset that holds GPU or CPU inference bundle. Accessed through {@link #getVision()}
   */
  private vision: any;
  private canvas: HTMLCanvasElement | null = null;

  /**
   * Reference to MediaPipe service interface.
   * @private
   */
  private poseLandmarker: PoseLandmarker | null = null;

  /**
   * Dynamic mutable settings.
   * @private
   */
  private config: Config = new Config();

  /**
   * Returns a new object graph, including smoothing (if configured)
   * @param nlss
   */
  processLandmarks(nlss: NormalizedLandmark[][]): NormalizedLandmark[][] {
    // TODO better smoothing using configurable proportional hysteresis etc.
    // TODO verify bug with more than 1 person: person index is probably unstable?
    //      so I need canonical sort (use, say, x pos of left shoulder?)
    // TODO if the number of landmarks in a single pose is previously smaller, just clone the new one
    // TODO multi-person logic needs serious review
    // currently smooth by averaging last two landmark points by finding the
    // midpoint between previous and next
    if (this.prevLandmarks.length > 0 && this.config.smoothing) {
      return this.prevLandmarks.map((nls: NormalizedLandmark[], nlsIdx: number) => {
        return nls.map((nl: NormalizedLandmark, nlIdx: number) => {
          if (nlss.length > nlsIdx && nlss[nlsIdx].length > nlIdx) {
            return midPoint(nl, nlss[nlsIdx][nlIdx]);
          } else {
            // new corresponding landmark is missing, return prev instead
            return nl;
          }
        });
      });
    } else {
      // straight clone
      return cloneLandmarks(nlss);
    }
  }

  setConfig(config: Config) {
    this.config = config;
  }

  calcPerfTime = () => {
    return new PerfTime(
      this.msVisionTime.mean(),
      this.msRenderTime.mean(),
      this.msUpdateTime.mean(),
    );
  };

  /**
   * A function that always returns the latest pose landmarks.
   */
  subscribe: () => Pose[] = () => {
    if (this.poseCacheDirty) {
      this.poseCache = this.calcPose(this.prevLandmarks);
      this.poseCacheDirty = false;
    }
    return this.poseCache;
  };

  /**
   * Draw landmarks as a registered overlay canvas over the given canvas at the given zIndex.
   * If the zIndex is lower than that of the canvas it will not be above!
   * Does not attach to the given canv if already created. To reattach, call resetCanvas() first.
   * TODO: maybe automatically draw at +1 of the zIndex of canv?
   * TODO: move drawing out of this class, subscribe to landmarks like poses
   */
  justDraw(dest: HTMLCanvasElement, zIndex: number) {
    const startUpdate = performance.now();
    if (!this.canvas) {
      // lazy init canvas
      console.log('lazy init drawing canvas');
      dest.parentNode!.appendChild(this.overlayCanvas(dest, zIndex));
    }
    if (this.canvas) {
      // TODO use 3D canvas drawing context?
      const ctx = this.canvas.getContext('2d', {
        willReadFrequently: false, // TODO do we need this or anything here?
      })!;

      // clear drawing area
      if (this.config.bg === 'Ghost') {
        ctx!.fillStyle = 'rgba(0, 0, 0, 0.1)'; // echo ghosts
      } else if (this.config.bg === 'Green') {
        ctx!.fillStyle = 'rgba(0, 255, 0, 1.0)';
      } else if (this.config.bg === 'Blue') {
        ctx!.fillStyle = 'rgba(0, 0, 255, 1.0)';
      } else if (this.config.bg === 'Black') {
        ctx!.fillStyle = 'rgba(0, 0, 0, 1.0)';
      }
      ctx!.fillRect(0, 0, this.canvas.width, this.canvas.height);


      // const plm = await this.getLandmarker(2, 'VIDEO');
      // const startVision = performance.now();
      // plm.detectForVideo(source, timestamp, (result: PoseLandmarkerResult) => {
      //   this.msVisionTime.push(performance.now() - startVision);
      //   if (result.landmarks.length > 1) {
      //     sortPeople(result.landmarks);
      //   }
      const startRender = performance.now();
      // drawDefaultLandmarkers(result, ctx);
      // const landmarks = this.config.smoothing ? this.processLandmarks(result.landmarks) : result.landmarks;

      drawCustomStickFigure(this.prevLandmarks, ctx, this.config.debug);
      this.msRenderTime.push(performance.now() - startRender);
      // });
    } else {
      console.warn('PoseSystem has no canvas?');
    }
    this.msUpdateTime.push(performance.now() - startUpdate);
  }

  /**
   * Detects landmarks in the given source, processes according to config and stores result.
   * @param source
   * @param timestamp
   */
  async detect(source: TexImageSource, timestamp: number) {
    const startVision = performance.now();
    const plm = await this.getLandmarker(2, 'VIDEO');
    plm.detectForVideo(source, timestamp, (result: PoseLandmarkerResult) => {
      if (result.landmarks.length > 1) {
        sortPeople(result.landmarks);
      }
      this.prevLandmarks = this.processLandmarks(result.landmarks);
    });
    this.msVisionTime.push(performance.now() - startVision);
  }

  /**
   * Removes any previously attached canvas element and attempts to free up resources used.
   */
  resetCanvas() {
    if (this.canvas) {
      this.canvas.remove();
    }
    this.poseLandmarker = null;
  }

  /**
   * Calculate the skeletal poses from the given landmarks.
   * @param lss
   */
  calcPose(lss: NormalizedLandmark[][]): Pose[] {
    // TODO unit test
    if (this.poseCacheDirty) {
      for (let i = 0; i < lss.length; i++) {
        const ls = this.prevLandmarks[i];
        // @ts-ignore
        const midEar = midPoint(ls[Body.left_ear], ls[Body.right_ear]);
        // head rotation vector is midEar to nose

        // @ts-ignore
        const midEye = midPoint(ls[Body.left_eye], ls[Body.right_ear]);

      }
    }
    return [];
  }

  /**
   * Gets body poses with trained model, running on GPU
   * @param numPoses the maximum number of people to detect
   * @param runningMode
   */
  private async getLandmarker(numPoses: 1 | 2 = 1, runningMode: RunningMode = 'VIDEO'): Promise<PoseLandmarker> {
    if (!this.poseLandmarker) {
      console.log('creating pose landmarker');
      this.poseLandmarker = await PoseLandmarker.createFromOptions(await this.getVision(), {
        baseOptions: {
          modelAssetPath: `/models/pose_landmarker_heavy.task`,
          delegate: 'GPU',
        },
        runningMode: runningMode,
        numPoses: numPoses,
      });
    }
    if (this.poseLandmarker) {
      return this.poseLandmarker;
    } else {
      console.warn('no poseLandmarker');
      return Promise.reject('No Pose Landmarker');
    }
  }

  /**
   * Internal lazy-initialising getter for the vision WasmFileset.
   * @private
   */
  private async getVision() {
    if (!this.vision) {
      console.log('Vision system loading');
      this.vision = await FilesetResolver.forVisionTasks('/node_modules/@mediapipe/tasks-vision/wasm');
      console.log('Vision system loaded');
    }
    return this.vision;
  }

  /**
   * Precisely fits a new canvas element on the given element.
   * @param canv target
   * @param zIndex the z-height of the created canvas
   * @private
   */
  private overlayCanvas(canv: HTMLCanvasElement, zIndex: number) {
    if (this.canvas) {
      console.warn('creating duplicate canvas!');
    }
    this.canvas = document.createElement('canvas') as HTMLCanvasElement;
    this.canvas.setAttribute('class', 'canvas');
    const bounds = canv.getBoundingClientRect();
    this.canvas.setAttribute('width', bounds.width * 2 + 'px');
    this.canvas.setAttribute('height', bounds.height * 2 + 'px');
    const refStyle = canv.computedStyleMap();
    this.canvas.setAttribute('style', `position: absolute;
        left: ${refStyle.get('left')};
        top: ${refStyle.get('top')};
        width: ${refStyle.get('width')};
        height: ${refStyle.get('height')};
        transform: ${refStyle.get('transform')};
        z-index: ${zIndex};
        object-fit: ${refStyle.get('object-fit')};
        object-position: ${refStyle.get('object-position')};`);
    return this.canvas;
  }
}

export { PoseSystem };