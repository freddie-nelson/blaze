import Blaze from "../src/blaze";
import { renderCube } from "../src/renderer";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
blz.initPlayer();

blz.addUpdateHook(() => {
  renderCube(blz.gl, blz.player.camera.getProjectionMatrix(), blz.player.camera.getViewMatrix());
});

blz.update();
