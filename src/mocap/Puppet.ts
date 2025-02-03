import { ISceneLoaderAsyncResult, Vector3 } from '@babylonjs/core';
import { CC0, CG_RF_NOAI, License, MIT } from '../License.ts';
import { BoneMap, BoneSpec } from './RiggedModel.ts';
import { RiggedModel } from './RiggedModel.tsx';

type PostLoader = (r: ISceneLoaderAsyncResult) => void;

export class Puppet implements RiggedModel {
  readonly attribution: string;
  readonly name: string;
  readonly license: License;
  readonly filepath: string;
  readonly charMeshIdx: number;
  readonly src: string;
  readonly boneMap: BoneMap;
  postLoad: PostLoader;

  constructor(name: string, attribution: string, license: License, src: string,
              filepath: string,
              boneMap: BoneMap, charMeshIdx: number, setup: PostLoader = () => {}) {
    this.name = name;
    this.attribution = attribution;
    this.license = license;
    this.src = src;
    this.filepath = filepath;
    this.boneMap = boneMap;
    this.charMeshIdx = charMeshIdx;
    this.postLoad = setup;
  }
}

/**
 * Convenience method for all the "low poly people" models, they have the same skeleton,
 * license, attribution requirements etc.
 * @param name short unique name
 * @param path file path
 */
const lpp = (name: string, path: string) => {
  const bm = {
    head: new BoneSpec('Head'), // 2 parent: Chest
    spine: new BoneSpec('Chest'), // parent: Stomach
    left_shoulder: new BoneSpec('Shoulder.L'), // parent: Chest
    right_shoulder: new BoneSpec('Shoulder.R'), // parent: Chest
    left_hip: new BoneSpec('Hip.L'), // parent: Stomach
    right_hip: new BoneSpec('Hip.R'), // parent: Stomach
  };
  return new Puppet(name, `${name} from Low Poly People by David Jalbert`,
    MIT, 'https://davidjalbert.itch.io/low-poly-people', path, bm, 1);
};

/**
 * Loads and displays.
 */
const fatManA = lpp('Fat Man A', '/3d/lpp/fat-man-a.glb');

/**
 * Loads and displays.
 */
const toonTrooper = new Puppet('Toon Trooper', 'Toon Trooper by Blender Zone', CG_RF_NOAI,
  'https://www.cgtrader.com/free-3d-models/character/sci-fi-character/toon-trooper-rigged', '/3d/TROOPER.glb',
  { head: new BoneSpec('HEAD'), spine: new BoneSpec('CHEST') }, 0, (r) => {
    r.meshes[0].scaling = new Vector3(0.2, 0.2, 0.2);
    // remove gun
    const gunIdx = 11;
    r.meshes[gunIdx].isVisible = false;
  });

const skaterBoneMap = {
  head: new BoneSpec('Head'),
  spine: new BoneSpec('Spine'),
};

/**
 * loads and displays correctly
 */
const skatergirl = new Puppet('SkaterGirl', 'Female Skater by Kenney',
  CC0, 'https://market.pmnd.rs/model/skater-female',
  '/3d/skatergirl.gltf', skaterBoneMap, 1);

const skaterboy = new Puppet('SkaterBoy', 'Male Skater by Kenney',
  CC0, 'https://market.pmnd.rs/model/skater-male',
  '/3d/skaterboy.gltf', skaterBoneMap, 1);

export const PUPPETS = [
  fatManA,
  toonTrooper,
  skaterboy,
  skatergirl,
  /*
    // did not appear although model data could be logged (blender export probably done wrong):
    new Puppet('Astronaut Orange Trim', 'Astronaut free VR / AR / low-poly 3d model', CG_RF_NOAI,
      'https://www.cgtrader.com/free-3d-models/character/sci-fi-character/astronaut-d481bc2e-fbf7-4512-93de-f1a6f429c7a6',
      '/3d/astronaut-orange-trim_4882913_Astronaut_1.glb', {head: 3, spine: 0}, 1),
  */
];

//low poly people (e.g. fat man a) bone dump:
// 	bone 0 Armature,
// 	bone 1 ROOT,
// 	bone 2 CHEST,
// 	bone 3 HEAD,
// 	bone 4 SHOULDER.001,
// 	bone 5 ARM.001,
// 	bone 6 FOREARM.001,
// 	bone 7 WRIST.001,
// 	bone 8 FINGER.009,
// 	bone 9 FINGER.010,
// 	bone 10 FINGER.011,
// 	bone 11 FINGER.012,
// 	bone 12 FINGER.013,
// 	bone 13 FINGER.014,
// 	bone 14 FINGER.015,
// 	bone 15 FINGER.016,
// 	bone 16 FINGER.017,
// 	bone 17 SHOULDER.002,
// 	bone 18 ARM.002,
// 	bone 19 FOREARM.002,
// 	bone 20 WRIST.002,
// 	bone 21 FINGER.018,
// 	bone 22 FINGER.019,
// 	bone 23 FINGER.020,
// 	bone 24 FINGER.021,
// 	bone 25 FINGER.022,
// 	bone 26 FINGER.023,
// 	bone 27 FINGER.024,
// 	bone 28 FINGER.025,
// 	bone 29 FINGER.026,
// 	bone 30 HIP,
// 	bone 31 THIGH R,
// 	bone 32 SHIN R,
// 	bone 33 THIGH L,
// 	bone 34 SHIN L,
// 	bone 35 WIRE BASE,
// 	bone 36 LEG R,
// 	bone 37 KNEE,
// 	bone 38 LEG. L,
// 	bone 39 KNEE.001

// skatergirl and skaterboy bone array dump:
//  bone 0 Root.003,
// 	bone 1 LeftFootCtrl,
// 	bone 2 LeftHeelRoll,
// 	bone 3 LeftToeRoll,
// 	bone 4 LeftFootIK,
// 	bone 5 LeftFootIK_end,
// 	bone 6 LeftFootRollCtrl,
// 	bone 7 LeftFootRollCtrl_end,
// 	bone 8 LeftKneeCtrl,
// 	bone 9 LeftKneeCtrl_end,
// 	bone 10 RightFootCtrl,
// 	bone 11 RightHeelRoll,
// 	bone 12 RightToeRoll,
// 	bone 13 RightFootIK,
// 	bone 14 RightFootIK_end,
// 	bone 15 RightFootRollCtrl,
// 	bone 16 RightFootRollCtrl_end,
// 	bone 17 RightKneeCtrl,
// 	bone 18 RightKneeCtrl_end,
// 	bone 19 HipsCtrl,
// 	bone 20 Hips,
// 	bone 21 Spine,
// 	bone 22 Chest,
// 	bone 23 UpperChest,
// 	bone 24 Neck,
// 	bone 25 Head,
// 	bone 26 Head_end,
// 	bone 27 LeftShoulder,
// 	bone 28 LeftArm,
// 	bone 29 LeftForeArm,
// 	bone 30 LeftHand,
// 	bone 31 LeftHandIndex1,
// 	bone 32 LeftHandIndex2,
// 	bone 33 LeftHandIndex3,
// 	bone 34 LeftHandIndex3_end,
// 	bone 35 LeftHandThumb1,
// 	bone 36 LeftHandThumb2,
// 	bone 37 LeftHandThumb2_end,
// 	bone 38 RightShoulder,
// 	bone 39 RightArm,
// 	bone 40 RightForeArm,
// 	bone 41 RightHand,
// 	bone 42 RightHandIndex1,
// 	bone 43 RightHandIndex2,
// 	bone 44 RightHandIndex3,
// 	bone 45 RightHandIndex3_end,
// 	bone 46 RightHandThumb1,
// 	bone 47 RightHandThumb2,
// 	bone 48 RightHandThumb2_end,
// 	bone 49 LeftUpLeg,
// 	bone 50 LeftLeg,
// 	bone 51 LeftFoot,
// 	bone 52 LeftToes,
// 	bone 53 LeftToes_end,
// 	bone 54 RightUpLeg,
// 	bone 55 RightLeg,
// 	bone 56 RightFoot,
// 	bone 57 RightToes,
// 	bone 58 RightToes_end

// toon trooper bone dump:
// 	bone 0 Armature,
// 	bone 1 ROOT,
// 	bone 2 CHEST,
// 	bone 3 HEAD,
// 	bone 4 SHOULDER.001,
// 	bone 5 ARM.001,
// 	bone 6 FOREARM.001,
// 	bone 7 WRIST.001,
// 	bone 8 FINGER.009,
// 	bone 9 FINGER.010,
// 	bone 10 FINGER.011,
// 	bone 11 FINGER.012,
// 	bone 12 FINGER.013,
// 	bone 13 FINGER.014,
// 	bone 14 FINGER.015,
// 	bone 15 FINGER.016,
// 	bone 16 FINGER.017,
// 	bone 17 SHOULDER.002,
// 	bone 18 ARM.002,
// 	bone 19 FOREARM.002,
// 	bone 20 WRIST.002,
// 	bone 21 FINGER.018,
// 	bone 22 FINGER.019,
// 	bone 23 FINGER.020,
// 	bone 24 FINGER.021,
// 	bone 25 FINGER.022,
// 	bone 26 FINGER.023,
// 	bone 27 FINGER.024,
// 	bone 28 FINGER.025,
// 	bone 29 FINGER.026,
// 	bone 30 HIP,
// 	bone 31 THIGH R,
// 	bone 32 SHIN R,
// 	bone 33 THIGH L,
// 	bone 34 SHIN L,
// 	bone 35 WIRE BASE,
// 	bone 36 LEG R,
// 	bone 37 KNEE,
// 	bone 38 LEG. L,
// 	bone 39 KNEE.001