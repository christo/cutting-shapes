/**
 * Map of model bone names
 */
export type BoneMap = {
  head: string,
  spine: string,
};

export type RiggedModel = {
  // TODO need to store something like per-bone rotation scale and offset pairs
  filepath: string,
  boneMap: BoneMap,
  charMeshIdx: number,
}