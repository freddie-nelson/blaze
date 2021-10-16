import { loadTexture } from "./utils/gl";

export default class Tilesheet {
  texture: WebGLTexture;
  numOfTiles: number;
  tileSize: number;
  width: number;
  height: number;

  constructor(gl: WebGL2RenderingContext, path: string, tileSize: number, numOfTiles: number) {
    this.texture = loadTexture(gl, path);
    this.numOfTiles = numOfTiles;
    this.tileSize = tileSize;
    this.width = tileSize * 3;
    this.height = tileSize * numOfTiles;
  }
}
