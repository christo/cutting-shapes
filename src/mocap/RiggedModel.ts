
/**
 * Map of model bone specifications.
 */
export type BoneMap = {
  head: BoneSpec,
  spine: BoneSpec,
};

/**
 * Mapping to enable named bones in a model to have offset and scaling applied
 * after {@link SkeletalRotation} is calculated on the canonical skeleton.
 */
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