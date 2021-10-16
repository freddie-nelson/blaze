import Blaze from "../src/blaze";
import Color from "../src/utils/Color";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
blz.initPlayer();
blz.initChunkController({
  gl: blz.gl,
  player: blz.player,
  worldSize: 1024,
  renderDist: 16,
  maxChunksPerTick: 1,
  bedrock: -127,
  chunkSize: 15,
  chunkHeight: 127,
});

blz.setTilesheet("tilesheet.png", 16, 22);
blz.skyColor = new Color("lightblue");

blz.toggleDebug();

blz.update();
