import { BLZ_CreateRenderer } from "./renderer";
import Player from "./player";
import Camera from "./camera";
import { clear } from "./utils/gl";

export default class Blaze {
  gl: WebGL2RenderingContext;

  player: Player;

  lastUpdateTime = performance.now();
  updateHooks: ((delta?: number) => void)[] = [];

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

  update() {
    requestAnimationFrame(() => this.update());
    const delta = (performance.now() - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = performance.now();

    clear(this.gl);
    this.player.update(delta);
    this.updateHooks.forEach((h) => h(delta));
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
    this.player = new Player(new Camera(this.gl));
  }
}
