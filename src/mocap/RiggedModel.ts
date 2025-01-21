/**
 * Map of {@link Body} to model bone name
 */
export type BoneMap = {
  head: string,
  spine: string,
};

export type RiggedModel = {
  filepath: string,
  boneMap: BoneMap,
  charMeshIdx: number,
}