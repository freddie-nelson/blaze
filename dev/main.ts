import Blaze from "../src/blaze";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
blz.initPlayer();

blz.initChunkController({
  gl: blz.gl,
  player: blz.player,
  renderDist: 16,
  queueLength: 1,
});

blz.update();
