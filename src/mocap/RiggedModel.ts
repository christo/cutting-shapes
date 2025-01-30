
/**
 * Map of model bone specifications.
 */
export type BoneMap = {
  head: BoneSpec,
  spine: BoneSpec,
};

export class BoneSpec {
  name: string;
  offset: number;
  scale: number;

  constructor(name: string, offset: number = 0, scale: number = 1) {
    this.name = name;
    this.offset = offset;
    this.scale = scale;
  }
}

export type RiggedModel = {
  // TODO need to store something like per-bone rotation scale and offset pairs
  filepath: string,
  boneMap: BoneMap,

  charMeshIdx: number,
}