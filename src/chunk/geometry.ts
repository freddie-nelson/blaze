import { from3Dto1D } from "../utils/arrays";
import { faces, Neighbours } from "../voxel";

export interface GeometryGeneratorOptions {
  chunkSize: number;
  chunkHeight: number;
  tileSize: number;
  tileTextureWidth: number;
  tileTextureHeight: number;
}

export default class GeometryGenerator {
  chunkSize: number;
  chunkHeight: number;
  tileSize: number;
  tileTextureWidth: number;
  tileTextureHeight: number;

  constructor(opts: GeometryGeneratorOptions) {
    this.chunkSize = opts.chunkSize;
    this.chunkHeight = opts.chunkHeight;
    this.tileSize = opts.tileSize;
    this.tileTextureWidth = opts.tileTextureWidth;
    this.tileTextureHeight = opts.tileTextureHeight;
  }

  convertGeoToTypedArrs(geo: { indices: number[]; vertices: number[] }) {
    return {
      vertices: new Float32Array(geo.vertices),
      indices: new Uint32Array(geo.indices),
    };
  }

  generateChunkGeometry(chunk: Uint8Array) {
    const indices: number[] = [];
    const vertices: number[] = [];

    for (let y = 0; y < this.chunkHeight; y++) {
      for (let x = 0; x < this.chunkSize; x++) {
        for (let z = 0; z < this.chunkSize; z++) {
          const id = chunk[x + this.chunkSize * (y + this.chunkHeight * z)];
          const { vertices: voxVertices, indices: voxIndices } = this.generateVoxelGeometry(
            id,
            x,
            y,
            z,
            this.getVoxelNeighbours(chunk, x, y, z),
            vertices.length
          );

          indices.push(...voxIndices);
          vertices.push(...voxVertices);
        }
      }
    }

    return {
      indices,
      vertices,
    };
  }

  generateVoxelGeometry(
    id: number,
    x: number,
    y: number,
    z: number,
    neighbours: Neighbours<number>,
    verticesLength: number
  ) {
    if (id === 0)
      return {
        vertices: [],
        indices: [],
      }; // empty

    const indices: number[] = [];
    const vertices: number[] = [];

    Object.keys(neighbours).forEach((k) => {
      const n = neighbours[k];
      if (!n || n === 0) {
        const ndx = verticesLength + vertices.length;

        for (let i = 0; i < faces[k].corners.length; i++) {
          const corner = faces[k].corners[i];

          // position { x: 4 bits, y: 8 bits, z: 4 bits } : format { x - y - z }
          let p = corner.pos[2] + z;
          p |= (corner.pos[1] + y) << 4;
          p |= (corner.pos[0] + x) << 12;
          p = p >>> 0;

          // normal 3 bits
          let normalScaled = faces[k].normal * 5;
          normalScaled = normalScaled >>> 0;

          // uv { texIndex: 8bits, uv: 2 bits }
          let u = i;
          u |= id << 2;
          u = u >>> 0;

          // vertex { position: 16 bits, normal: 3 bits, uv: 10 bits } : format { position - normal - uv }
          const vertex = (p << 13) | (normalScaled << 10) | u;
          vertices.push(vertex);

          // check for errors in bitwise operations
          // const x1 = (vertex & 0x1e000000) >> 25;
          // const y1 = (vertex & 0x1fe0000) >> 17;
          // const z1 = (vertex & 0x1e000) >> 13;
          // if (x1 !== corner.pos[0] + x) console.log("x: " + x1, corner.pos[0] + x);
          // if (y1 !== corner.pos[1] + y) console.log("y: " + y1, corner.pos[1] + y);
          // if (z1 !== corner.pos[2] + z) console.log("z: " + z1, corner.pos[2] + z);
        }

        indices.push(ndx, ndx + 1, ndx + 2, ndx, ndx + 2, ndx + 3);
        // console.log(indices, vertices);

        // for (const i of indices) {
        //   const x1 = (vertices[i] & 0x1e000000) >> 25;
        //   const y1 = (vertices[i] & 0x1fe0000) >> 17;
        //   const z1 = (vertices[i] & 0x1e000) >> 13;

        //   console.log(x1, y1, z1);
        // }
      }
    });

    return {
      vertices,
      indices,
    };
  }

  private getVoxelNeighbours(chunk: Uint8Array, x: number, y: number, z: number) {
    const neighbours: Neighbours<number> = {
      back: z - 1 >= 0 ? chunk[from3Dto1D(x, y, z - 1, this.chunkSize, this.chunkHeight)] : null,
      front: z + 1 < this.chunkSize ? chunk[from3Dto1D(x, y, z + 1, this.chunkSize, this.chunkHeight)] : null,
      left: x - 1 >= 0 ? chunk[from3Dto1D(x - 1, y, z, this.chunkSize, this.chunkHeight)] : null,
      right: x + 1 < this.chunkSize ? chunk[from3Dto1D(x + 1, y, z, this.chunkSize, this.chunkHeight)] : null,
      top: y + 1 < this.chunkHeight ? chunk[from3Dto1D(x, y + 1, z, this.chunkSize, this.chunkHeight)] : null,
      bottom: y - 1 >= 0 ? chunk[from3Dto1D(x, y - 1, z, this.chunkSize, this.chunkHeight)] : null,
    };

    return neighbours;
  }
}
