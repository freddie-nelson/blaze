import ChunkController, { Chunks } from "./controller";

/**
 * Contains methods to parse chunks in a {@link ChunkController} or otherwise into strings and back.
 */
export default class ChunkParser {
  /**
   * Turns the provided chunks into a string that can be exported/saved.
   *
   * @param chunks The chunks to create the string from
   */
  static chunksToString(chunks: Chunks): string {
    const keys = Object.keys(chunks);
    if (keys.length === 0) return "";

    let str = `${chunks[keys[0]].length}|`;

    for (const k of keys) {
      const chunk = chunks[k];
      str += `${k}[${chunk.toString()}]|`;
    }

    return str;
  }

  /**
   * Turns the provided string from `this.chunksToString` back into the original chunks.
   *
   * @param str The string to parse into chunks
   */
  static stringToChunks(str: string): Chunks {
    const chunks: Chunks = {};
    let length = 0;
    let curr = 0;
    let key = "";
    let chunk: Uint8Array;
    let chunkIndex = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (char === "|") {
        if (!length) length = Number(str.substring(curr, i));
        curr = i + 1;
      } else if (char === "[") {
        key = str.substring(curr, i);
        chunk = new Uint8Array(length);
        chunkIndex = 0;
        curr = i + 1;
      } else if (char === "]") {
        chunk.set([Number(str.substring(curr, i))], chunkIndex);
        chunks[key] = chunk;
      } else if (char === ",") {
        chunk.set([Number(str.substring(curr, i))], chunkIndex);
        curr = i + 1;
        chunkIndex++;
      }
    }

    return chunks;
  }
}
