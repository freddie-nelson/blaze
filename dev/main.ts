import Blaze from "../lib/src/blaze";
import { createBuildAndBreakHandler } from "../lib/src/dropins/player/blockPicking";
import { addKeyListener } from "../lib/src/keyboard";
import { isMouseDown, Mouse } from "../lib/src/mouse";
import Color from "../lib/src/utils/color";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
blz.initPlayer();
blz.initChunkController({
  gl: blz.gl,
  player: blz.player,
  worldSize: 10000,
  renderDist: 12,
  maxChunksPerTick: navigator.hardwareConcurrency,
  bedrock: -127,
  chunkSize: 8,
  chunkHeight: 127,
});

blz.player.enableBlockPicking(
  blz.chunkController,
  40,
  createBuildAndBreakHandler(blz, {
    buildDelay: 0,
    breakDelay: 0,

    canBreak: () => isMouseDown(Mouse.LEFT),
    canBuild: () => isMouseDown(Mouse.RIGHT),

    onBreak: (i, chunk) => (chunk[i] = 0),
    onBuild: (i, chunk) => (chunk[i] = 1),
  })
);

// optifine like zoom
addKeyListener("KeyC", (pressed) => {
  if (pressed) {
    blz.player.camera.setFov(blz.gl, 30);
  } else {
    blz.player.camera.setFov(blz.gl, 70);
  }
});

blz.setTilesheet("tilesheet.png", 16, 22);
blz.skyColor = new Color("skyblue");

blz.toggleDebug();

blz.update();
