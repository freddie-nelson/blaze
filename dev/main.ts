import { vec3 } from "gl-matrix";
import Blaze from "../src/blaze";
import { addKeyListener } from "../src/keyboard";
import Color from "../src/utils/color";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
blz.initPlayer({
  movement: {},
});
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

blz.player.toggleBlockPicking(true, blz.chunkController, 5);

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
