import { createRenderer, resizeRendererToCanvas } from "./renderer";
import Player from "./player";
import { clear } from "./utils/gl";
import ChunkController, { ChunkControllerOptions } from "./chunk/controller";
import Debug from "./debug";
import { glMatrix } from "gl-matrix";
import Tilesheet from "./tilesheet";
import Color from "./utils/Color";

export default class Blaze {
  gl: WebGL2RenderingContext;
  private debug: Debug;

  player: Player;
  skyColor = new Color("lightblue");

  chunkController: ChunkController;

  lastUpdateTime = performance.now();
  updateHooks: ((delta?: number) => void)[] = [];

  /**
   * Initializes the engine and creates the renderer
   *
   * @param canvas
   * @returns instance of blaze engine
   */
  constructor(canvas: HTMLCanvasElement) {
    const gl = createRenderer(canvas);
    this.gl = gl;

    this.gl.canvas.addEventListener("resize", () => {
      resizeRendererToCanvas(gl);
      if (this.player) this.player.camera.setProjectionMatrix(gl);
    });

    glMatrix.setMatrixArrayType(Array);
  }

  update() {
    requestAnimationFrame(() => this.update());
    const delta = (performance.now() - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = performance.now();

    clear(this.gl, this.skyColor);

    this.player.update(delta);
    if (this.chunkController) this.chunkController.update();

    this.updateHooks.forEach((h) => h(delta));

    if (this.debug) this.debug.update(delta);
  }

  addUpdateHook(hook: (delta?: number) => void) {
    this.updateHooks.push(hook);
  }

  removeUpdateHook(hook: (delta?: number) => void) {
    const i = this.updateHooks.findIndex((h) => hook === h);
    if (i === -1) return false;

    this.updateHooks.splice(i, 1);
  }

  initPlayer() {
    this.player = new Player(this.gl);
  }

  initChunkController(opts: ChunkControllerOptions) {
    this.chunkController = new ChunkController(opts);
  }

  setTilesheet(path: string, tileSize: number, numOfTiles: number) {
    if (!this.chunkController) throw new Error("You must init the chunk controller before tilesheet.");

    this.chunkController.tilesheet = new Tilesheet(this.gl, path, tileSize, numOfTiles);
  }

  toggleDebug() {
    if (!this.debug) this.debug = new Debug(this);
    else {
      this.debug.dispose();
      this.debug = undefined;
    }
  }
}
