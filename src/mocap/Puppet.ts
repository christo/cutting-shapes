import { Axis, ISceneLoaderAsyncResult, Vector3 } from '@babylonjs/core';
import { License } from './License.ts';
import { RiggedModel } from './RiggedModel.tsx';

const CC_BY = new License("CC-BY", 'CC-BY Creative Commons By Attribution');
const CG_RF_NOAI = new License("CG-RF-NOAI", 'CG Trader Royalty Free License - No AI');
const CC0 = new License("CC0", 'CC0 (Public Domain)');
const MIT = new License("MIT", 'MIT License');

type PostLoader = (r: ISceneLoaderAsyncResult) => void;

export class Puppet implements RiggedModel {
  readonly attribution: string;
  readonly name: string;
  readonly license: License;
  readonly filepath: string;
  readonly headIdx: number;
  readonly charMeshIdx: number;
  readonly src: string;
  postLoad: PostLoader;

  constructor(name: string, attribution: string, license: License, src: string,
              filepath: string,
              headIdx: number, charMeshIdx: number, setup: PostLoader = () => {}) {
    this.name = name;
    this.attribution = attribution;
    this.license = license;
    this.src = src;
    this.filepath = filepath;
    this.headIdx = headIdx;
    this.charMeshIdx = charMeshIdx;
    this.postLoad = setup;
  }
}

const lpp = (name: string, path: string) => {
  return new Puppet(name, `${name} from Low Poly People by David Jalbert`,
    MIT, 'https://davidjalbert.itch.io/low-poly-people', path, 2, 1);
};
export const PUPPETS = [

  new Puppet('Toon Trooper', 'Toon Trooper by Blender Zone', CG_RF_NOAI,
    'https://www.cgtrader.com/free-3d-models/character/sci-fi-character/toon-trooper-rigged', '/3d/TROOPER.glb',
    3, 0, (r) => {
      r.meshes[0].scaling = new Vector3(0.2, 0.2, 0.2);
      r.meshes[0].rotate(Axis.Y, Math.PI);
      // remove gun
      const gunIdx = 11;
      r.meshes[gunIdx].isVisible = false;
    }),

  new Puppet('Astronaut', 'Astronaut by Polygonal Mind', CC_BY,
    'https://poly.pizza/m/dLHpzNdygsg', '/3d/Astronaut.glb', 0, 0),

  // did not appear although model data could be logged (blender export probably done wrong):
  new Puppet('Astronaut Orange Trim', 'Astronaut free VR / AR / low-poly 3d model', CG_RF_NOAI,
    'https://www.cgtrader.com/free-3d-models/character/sci-fi-character/astronaut-d481bc2e-fbf7-4512-93de-f1a6f429c7a6',
    '/3d/astronaut-orange-trim_4882913_Astronaut_1.glb', 3, 1),
  new Puppet('SkaterGirl', 'Female Skater by Kenney', CC0,
    'https://market.pmnd.rs/model/skater-female',
    '/3d/skatergirl.gltf', 25, 1),
  new Puppet('SkaterBoy', 'Male Skater by Kenney', CC0,
    'https://market.pmnd.rs/model/skater-male',
    '/3d/skaterboy.gltf', 25, 1),
  lpp('Fat Man A', '/3d/lpp/fat-man-a.glb'),
  new Puppet('Wren', 'Wren, the thief by Thomas de Rivaz [CC-BY] via Poly Pizza',
    CC_BY, 'https://poly.pizza/m/3YwDWHEtFid',
    '/3d/Wren the thief.glb', 0, 0),
];