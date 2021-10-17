import Blaze from "../src/blaze";
import Color from "../src/utils/color";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
blz.initPlayer();
blz.initChunkController({
  gl: blz.gl,
  player: blz.player,
  worldSize: 1024,
  renderDist: 16,
  maxChunksPerTick: 1,
  bedrock: -127,
  chunkSize: 8,
  chunkHeight: 127,
});

blz.player.toggleBlockPicking(true, blz.chunkController, 5);

blz.setTilesheet("tilesheet.png", 16, 22);
blz.skyColor = new Color("skyblue");

blz.toggleDebug();

blz.update();
