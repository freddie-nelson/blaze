import { from3Dto1D } from "../utils/arrays";

export interface ChunkGeneratorOpts {
  height: number;
  size: number;
}

export type Generator = (chunk: Uint8Array, pos: { x: number; y: number }, opts: ChunkGeneratorOpts) => void;

export default class ChunkGenerator {
  opts: ChunkGeneratorOpts;
  height: number;
  size: number;

  generators: Generator[] = [];

  constructor(opts: ChunkGeneratorOpts) {
    this.opts = opts;
    this.height = opts.height;
    this.size = opts.size;
  }

  /**
   * Creates an empty **flat** Uint8Array of length **this.height** * **this.size** * **this.size**
   * to represent the chunk's voxel ids
   *
   * @param opts
   * @returns
   */
  private emptyChunk() {
    return new Uint8Array(this.height * this.size * this.size).fill(1);
  }

  addGenerator(...generator: Generator[]) {
    this.generators.push(...generator);
  }

  removeGenerator(generator: Generator) {
    const i = this.generators.findIndex((g) => g === generator);
    if (i === -1) {
      this.generators.splice(i, 1);
      return true;
    }

    return false;
  }

  clearGenerators() {
    this.generators.length = 0;
  }

  generateChunk(pos: { x: number; y: number }) {
    const chunk = this.emptyChunk();
    // if (Math.random() < 0.2) chunk.fill(0);
    // chunk[from3Dto1D(0, 0, 0, this.size, this.height)] = 1;
    // chunk[from3Dto1D(0, 1, 0, this.size, this.height)] = 1;
    // chunk[from3Dto1D(1, 0, 0, this.size, this.height)] = 1;
    // chunk[from3Dto1D(0, 0, 1, this.size, this.height)] = 1;
    // chunk[from3Dto1D(0, 0, 2, this.size, this.height)] = 1;
    // chunk[from3Dto1D(2, 0, 0, this.size, this.height)] = 1;
    // chunk[from3Dto1D(1, 0, 1, this.size, this.height)] = 1;
    // chunk[from3Dto1D(0, 1, 1, this.size, this.height)] = 1;
    // chunk[from3Dto1D(1, 1, 0, this.size, this.height)] = 1;
    // chunk[from3Dto1D(0, 2, 0, this.size, this.height)] = 1;

    // chunk[from3Dto1D(7, 0, 0, this.size, this.height)] = 1;
    // chunk[from3Dto1D(7, 1, 0, this.size, this.height)] = 1;
    // chunk[from3Dto1D(6, 0, 0, this.size, this.height)] = 1;
    // chunk[from3Dto1D(7, 0, 1, this.size, this.height)] = 1;
    // chunk[from3Dto1D(7, 0, 2, this.size, this.height)] = 1;
    // chunk[from3Dto1D(5, 0, 0, this.size, this.height)] = 1;
    // chunk[from3Dto1D(6, 0, 1, this.size, this.height)] = 1;
    // chunk[from3Dto1D(7, 1, 1, this.size, this.height)] = 1;
    // chunk[from3Dto1D(6, 1, 0, this.size, this.height)] = 1;
    // chunk[from3Dto1D(7, 2, 0, this.size, this.height)] = 1;

    // chunk[from3Dto1D(7, 0, 7, this.size, this.height)] = 1;
    // chunk[from3Dto1D(7, 1, 7, this.size, this.height)] = 1;
    // chunk[from3Dto1D(6, 0, 7, this.size, this.height)] = 1;
    // chunk[from3Dto1D(7, 0, 6, this.size, this.height)] = 1;
    // chunk[from3Dto1D(7, 0, 5, this.size, this.height)] = 1;
    // chunk[from3Dto1D(5, 0, 7, this.size, this.height)] = 1;
    // chunk[from3Dto1D(6, 0, 6, this.size, this.height)] = 1;
    // chunk[from3Dto1D(7, 1, 6, this.size, this.height)] = 1;
    // chunk[from3Dto1D(6, 1, 7, this.size, this.height)] = 1;
    // chunk[from3Dto1D(7, 2, 7, this.size, this.height)] = 1;

    // chunk[from3Dto1D(0, 0, 7, this.size, this.height)] = 1;
    // chunk[from3Dto1D(0, 1, 7, this.size, this.height)] = 1;
    // chunk[from3Dto1D(1, 0, 7, this.size, this.height)] = 1;
    // chunk[from3Dto1D(0, 0, 6, this.size, this.height)] = 1;
    // chunk[from3Dto1D(0, 0, 5, this.size, this.height)] = 1;
    // chunk[from3Dto1D(2, 0, 7, this.size, this.height)] = 1;
    // chunk[from3Dto1D(1, 0, 6, this.size, this.height)] = 1;
    // chunk[from3Dto1D(0, 1, 6, this.size, this.height)] = 1;
    // chunk[from3Dto1D(1, 1, 7, this.size, this.height)] = 1;
    // chunk[from3Dto1D(0, 2, 7, this.size, this.height)] = 1;

    this.generators.forEach((g) => g(chunk, pos, this.opts));

    return chunk;
  }
}
