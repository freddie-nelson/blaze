import Blaze from "../src/blaze";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
blz.initPlayer();
blz.initChunkController({
  gl: blz.gl,
  player: blz.player,
  worldSize: 1024,
  renderDist: 12,
  maxChunksPerTick: 1,
  bedrock: -128,
  chunkSize: 8,
  chunkHeight: 128,
});

blz.setTilesheet("tilesheet.png", 16, 22);

blz.toggleDebug();

blz.update();
