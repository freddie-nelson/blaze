import Blaze from "../src/blaze";
import { BLZ_RenderCube } from "../src/renderer";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
blz.initPlayer();

blz.addUpdateHook(() => {
  BLZ_RenderCube(blz.gl, blz.player.camera.getProjectionMatrix(), blz.player.camera.getViewMatrix());
});

blz.update();
