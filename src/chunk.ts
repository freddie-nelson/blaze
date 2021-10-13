interface ChunkOptions {
  height: number;
  size: number;
}

/**
 * Creates an empty **flat** Uint8Array of length **opts.height** * **opts.size** * **opts.size**
 * to represent the chunk's voxel ids
 *
 * @param opts
 * @returns
 */
export function initChunk(opts: ChunkOptions) {
  return new Uint8Array(opts.height * opts.size * opts.size);
}

type Generator = (chunk: Uint8Array, opts: ChunkOptions) => void;
const generators: Generator[] = [];

export function addChunkGenerator(generator: Generator) {
  generators.push(generator);
}

export function removeChunkGenerator(generator: Generator) {
  const i = generators.findIndex((g) => g === generator);
  if (i === -1) {
    generators.splice(i, 1);
    return true;
  }

  return false;
}

export function clearChunkGenerators() {
  generators.length = 0;
}

export function generateChunk(opts: ChunkOptions) {
  const chunk = initChunk(opts);
  generators.forEach((g) => g(chunk, opts));

  return chunk;
}
