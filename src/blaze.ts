import { createRenderer } from "./renderer";
import Player from "./player";
import { clear } from "./utils/gl";
import ChunkController, { ChunkControllerOptions } from "./chunk/controller";
import Debug from "./debug";

export default class Blaze {
  gl: WebGL2RenderingContext;
  private debug: Debug;

  player: Player;
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
  }

  update() {
    requestAnimationFrame(() => this.update());
    const delta = (performance.now() - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = performance.now();

    clear(this.gl);

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

  toggleDebug() {
    if (!this.debug) this.debug = new Debug(this);
    else {
      this.debug.dispose();
      this.debug = undefined;
    }
  }
}
