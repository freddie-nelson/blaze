import { vec3 } from "gl-matrix";

export interface Neighbours<T> {
  [index: string]: T;
  left?: T;
  right?: T;
  bottom?: T;
  top?: T;
  front?: T;
  back?: T;
  fl?: T;
  fr?: T;
  bl?: T;
  br?: T;
}

export interface Face {
  uvCol: number;
  normal: number;
  corners: { pos: number[]; uv: number[] }[];
}

// face geometry
export const faces: { [index: string]: Face } = {
  left: {
    uvCol: 1,
    normal: 0.8,
    corners: [
      { pos: [0, 0, 0], uv: [1, 1] },
      { pos: [0, 0, 1], uv: [0, 1] },
      { pos: [0, 1, 1], uv: [0, 0] },
      { pos: [0, 1, 0], uv: [1, 0] },
    ],
  },
  right: {
    uvCol: 1,
    normal: 0.8,
    corners: [
      { pos: [1, 0, 0], uv: [0, 1] },
      { pos: [1, 1, 0], uv: [0, 0] },
      { pos: [1, 1, 1], uv: [1, 0] },
      { pos: [1, 0, 1], uv: [1, 1] },
    ],
  },
  bottom: {
    uvCol: 2,
    normal: 0.4,
    corners: [
      { pos: [0, 0, 0], uv: [1, 0] },
      { pos: [1, 0, 0], uv: [1, 1] },
      { pos: [1, 0, 1], uv: [0, 1] },
      { pos: [0, 0, 1], uv: [0, 0] },
    ],
  },
  top: {
    uvCol: 0,
    normal: 1,
    corners: [
      { pos: [0, 1, 0], uv: [0, 0] },
      { pos: [0, 1, 1], uv: [1, 0] },
      { pos: [1, 1, 1], uv: [1, 1] },
      { pos: [1, 1, 0], uv: [0, 1] },
    ],
  },
  front: {
    uvCol: 1,
    normal: 0.6,
    corners: [
      { pos: [0, 0, 0], uv: [0, 1] },
      { pos: [0, 1, 0], uv: [0, 0] },
      { pos: [1, 1, 0], uv: [1, 0] },
      { pos: [1, 0, 0], uv: [1, 1] },
    ],
  },
  back: {
    uvCol: 1,
    normal: 0.6,
    corners: [
      { pos: [0, 0, 1], uv: [1, 1] },
      { pos: [1, 0, 1], uv: [0, 1] },
      { pos: [1, 1, 1], uv: [0, 0] },
      { pos: [0, 1, 1], uv: [1, 0] },
    ],
  },
};

/**
 * Translates a world position into a local chunk and voxel position.
 *
 * @param position
 * @param chunkSize
 * @param chunkOffset
 * @param bedrock
 * @returns The chunks local position and the voxel's local position within the chunk.
 */
export function getVoxel(position: vec3, chunkSize: number, bedrock: number) {
  const chunk = {
    x: Math.floor(position[0] / chunkSize),
    y: Math.floor(position[2] / chunkSize),
  };

  const chunkWorldX = chunk.x * chunkSize;
  const chunkWorldZ = chunk.y * chunkSize;

  const voxel = {
    x: Math.floor(position[0]) - chunkWorldX,
    y: Math.floor(position[1]) - bedrock - 1,
    z: Math.floor(position[2]) - chunkWorldZ,
  };

  return {
    chunk,
    voxel,
  };
}
