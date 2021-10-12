interface ChunkOptions {
  height: number;
  size: number;
}

export function BLZ_InitChunk(opts: ChunkOptions) {
  return new Uint8Array(opts.height * opts.size * opts.size);
}

type Generator = (chunk: Uint8Array, opts: ChunkOptions) => void;
const generators: Generator[] = [];

export function BLZ_AddChunkGenerator(generator: Generator) {
  generators.push(generator);
}

export function BLZ_RemoveChunkGenerator(generator: Generator) {
  const i = generators.findIndex((g) => g === generator);
  if (i === -1) {
    generators.splice(i, 1);
    return true;
  }

  return false;
}

export function BLZ_ClearGenerators() {
  generators.length = 0;
}

export function BLZ_GenerateChunk(opts: ChunkOptions) {
  const chunk = BLZ_InitChunk(opts);
  generators.forEach((g) => g(chunk, opts));

  return chunk;
}
