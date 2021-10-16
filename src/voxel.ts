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
