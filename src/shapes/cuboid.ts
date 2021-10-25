import { vec3 } from "gl-matrix";
import Object3D from "../object3d";

// vertices for a cube
// brb = back right bottom
// blb = back left bottom
// brt = back right top
// blt = back left top
// frb = front right bottom
// flb = front left bottom
// frt = front right top
// flt = front left top
const baseVertices = {
  frb: [0, 0, 1.0],
  flb: [1.0, 0, 1.0],
  frt: [1.0, 1.0, 1.0],
  flt: [0, 1.0, 1.0],

  brb: [0, 0, 0],
  brt: [0, 1.0, 0],
  blt: [1.0, 1.0, 0],
  blb: [1.0, 0, 0],
};

// geometry indices
const indices = [
  0,
  1,
  2,
  0,
  2,
  3, // front
  4,
  5,
  6,
  4,
  6,
  7, // back
  8,
  9,
  10,
  8,
  10,
  11, // top
  12,
  13,
  14,
  12,
  14,
  15, // bottom
  16,
  17,
  18,
  16,
  18,
  19, // right
  20,
  21,
  22,
  20,
  22,
  23, // left
];

/**
 * Represents a Cuboid in 3D space with a width, height and depth.
 */
export default class Cuboid extends Object3D {
  private width: number;
  private height: number;
  private depth: number;

  /**
   * Creates a new {@link Cuboid} instance with a position and dimensions.
   *
   * @param position The cuboid's position in world space
   * @param width The width of the cuboid (x size)
   * @param height The height of the cuboid (y size)
   * @param depth The depth of the cuboid (z size)
   */
  constructor(position: vec3, width: number, height: number, depth: number) {
    super();
    this.setPosition(position);

    this.width = width;
    this.height = height;
    this.depth = depth;
  }

  /**
   * Calculates the cuboid's vertex positions based on the cuboid's dimensions.
   *
   * @returns The cuboid's geometry (vertices and indices)
   */
  getGeometry() {
    const bv = {
      frb: this.vertexAdd(baseVertices.frb, [0, 0, this.depth]),
      flb: this.vertexAdd(baseVertices.flb, [this.width, 0, this.depth]),
      frt: this.vertexAdd(baseVertices.frt, [this.width, this.height, this.depth]),
      flt: this.vertexAdd(baseVertices.flt, [0, this.height, this.depth]),

      brb: [...baseVertices.brb],
      brt: this.vertexAdd(baseVertices.brt, [0, this.height, 0]),
      blt: this.vertexAdd(baseVertices.blt, [this.width, this.height, 0]),
      blb: this.vertexAdd(baseVertices.blb, [this.width, 0, 0]),
    };

    const vertices = [
      // front face
      ...bv.frb,
      ...bv.flb,
      ...bv.frt,
      ...bv.flt,

      // back face
      ...bv.brb,
      ...bv.brt,
      ...bv.blt,
      ...bv.blb,

      // top face
      ...bv.brt,
      ...bv.flt,
      ...bv.frt,
      ...bv.blt,

      // bottom face
      ...bv.brb,
      ...bv.blb,
      ...bv.flb,
      ...bv.frb,

      // right face
      ...bv.blb,
      ...bv.blt,
      ...bv.frt,
      ...bv.flb,

      // left face
      ...bv.brb,
      ...bv.frb,
      ...bv.flt,
      ...bv.brt,
    ];

    return {
      vertices,
      indices,
    };
  }

  /**
   * Calculates the cuboid's vertex positions with the origin vector added to them.
   *
   * @param origin The vec3 to get the vertices position relative to.
   * @returns
   */
  getGeometryRelative(origin: vec3) {
    const geo = this.getGeometry();

    return {
      vertices: geo.vertices.map((v, i) => {
        if (i % 3 === 0) return v + origin[0];
        else if (i % 3 === 1) return v + origin[1];
        else if (i % 3 === 2) return v + origin[2];
      }),
      indices: geo.indices,
    };
  }

  /**
   * Adds the components of v1 and v2 and returns the resulting vector.
   *
   * @param v1 The first vector
   * @param v2 The second vector
   * @returns A new vector with the added components
   */
  private vertexAdd(v1: number[], v2: number[]) {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
  }
}
