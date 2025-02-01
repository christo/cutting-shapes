
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

/**
 * Represents a loadable character model file that can be controlled by
 * common skeletal manipulation. Per-model differences between model rigging and
 * geometry live in this object graph.
 */
export type RiggedModel = {
  filepath: string,
  boneMap: BoneMap,

  /**
   * The index of the main character mesh in the loaded file.
   */
  charMeshIdx: number,
}