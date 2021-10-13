import { BLZ_CreateRenderer } from "./renderer";

export default class Blaze {
  gl: WebGL2RenderingContext;

  /**
   * Initializes the engine and creates the renderer
   *
   * @param canvas
   * @returns instance of blaze engine
   */
  constructor(canvas: HTMLCanvasElement) {
    const gl = BLZ_CreateRenderer(canvas);
    this.gl = gl;
  }
}
