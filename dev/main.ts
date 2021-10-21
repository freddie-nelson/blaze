import Blaze from "../lib/src/blaze";
import { createBuildAndBreakHandler } from "../lib/src/dropins/player/blockPicking";
import { addKeyListener } from "../lib/src/keyboard";
import { isMouseDown, Mouse } from "../lib/src/mouse";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
// blz.setResolutionScale(0.5);

const player = blz.setPlayer();

// setup chunk controller
const chunkController = blz.setChunkController({
  gl: blz.gl,
  object: player,
  camera: player.camera,
  worldSize: 10000,
  renderDist: 12,
  chunksPerTick: navigator.hardwareConcurrency,
  bedrock: -127,
  chunkSize: 8,
  chunkHeight: 127,
});

player.enableBlockPicking(
  chunkController,
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
    player.camera.setFov(blz.gl, 30);
  } else {
    player.camera.setFov(blz.gl, 70);
  }
});

blz.setTilesheet("tilesheet.png", 16, 22);
blz.setSkyColor("skyblue");

blz.toggleDebug();
blz.start();
