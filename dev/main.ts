import Blaze from "../src/blaze";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
blz.initPlayer();
blz.initChunkController({
  gl: blz.gl,
  player: blz.player,
  worldSize: 1024,
  renderDist: 16,
  maxChunksPerTick: 1,
  bedrock: -255,
});

blz.toggleDebug();

blz.update();
