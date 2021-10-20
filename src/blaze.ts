import { createRenderer, resizeRendererToCanvas } from "./renderer";
import Player, { PlayerOptions } from "./player";
import { clear } from "./utils/gl";
import ChunkController, { ChunkControllerOptions } from "./chunk/controller";
import Debug from "./debug";
import { glMatrix } from "gl-matrix";
import Tilesheet from "./tilesheet";
import Color from "./utils/color";
import ThreadPool from "./threading/threadPool";

export interface BlazeOptions {
  antialias: boolean;
}

const defaultOpts: BlazeOptions = {
  antialias: false,
};

export default class Blaze {
  gl: WebGL2RenderingContext;
  private debug: Debug;

  player: Player;
  skyColor = new Color("#000");

  chunkController: ChunkController;
  threadPool = new ThreadPool();

  lastUpdateTime = performance.now();
  updateHooks: ((delta?: number) => void)[] = [];

  /**
   * Initializes the engine and creates the renderer
   *
   * @param canvas
   * @returns instance of blaze engine
   */
  constructor(canvas: HTMLCanvasElement, opts: BlazeOptions = defaultOpts) {
    const gl = createRenderer(canvas, { antialias: opts.antialias });
    this.gl = gl;

    window.addEventListener("resize", () => {
      resizeRendererToCanvas(gl);
      if (this.player) {
        this.player.camera.setProjectionMatrix(gl);
      }
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

  initPlayer(opts?: PlayerOptions) {
    this.player = new Player(this.gl, opts);
  }

  initChunkController(opts: ChunkControllerOptions) {
    this.chunkController = new ChunkController(opts, this.threadPool);
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
