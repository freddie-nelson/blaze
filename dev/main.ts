import { vec3 } from "gl-matrix";
import Blaze from "../src/blaze";
import { createBuildAndBreakHandler } from "../src/dropins/player/blockpicking";
import { addKeyListener } from "../src/keyboard";
import { isMouseDown, MOUSE } from "../src/mouse";
import Color from "../src/utils/color";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
blz.initPlayer();
blz.initChunkController({
  gl: blz.gl,
  player: blz.player,
  worldSize: 10000,
  renderDist: 16,
  maxChunksPerTick: 1,
  bedrock: -127,
  chunkSize: 8,
  chunkHeight: 127,
});

blz.player.enableBlockPicking(
  blz.chunkController,
  5,
  createBuildAndBreakHandler(blz, {
    buildDelay: 200,
    breakDelay: 200,

    canBreak: () => isMouseDown(MOUSE.LEFT),
    canBuild: () => isMouseDown(MOUSE.RIGHT),

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
