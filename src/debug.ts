import Blaze from "./blaze";

export default class Debug {
  blz: Blaze;

  // elements
  container: HTMLDivElement;
  fps: HTMLParagraphElement;
  coords: HTMLParagraphElement;
  chunk: HTMLParagraphElement;
  chunks: HTMLParagraphElement;
  queued: HTMLParagraphElement;
  camera: HTMLParagraphElement;
  frustum: HTMLParagraphElement;

  constructor(blz: Blaze) {
    this.blz = blz;

    const container = document.createElement("div");
    container.setAttribute(
      "style",
      "position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; background-color: rgba(0, 0, 0, 0.5); padding: 8px; border-radius: 4px;"
    );
    document.body.appendChild(container);
    this.container = container;

    this.fps = this.createText();
    this.coords = this.createText();
    this.chunk = this.createText();
    this.chunks = this.createText();
    this.queued = this.createText();
    this.camera = this.createText();
    this.frustum = this.createText();
  }

  update(delta: number) {
    const player = this.blz.player;
    const position = player.getPosition();
    const chunk = this.blz.chunkController.getChunk(position);
    chunk.x -= this.blz.chunkController.chunkOffset;
    chunk.y -= this.blz.chunkController.chunkOffset;

    this.fps.innerText = `FPS: ${(1 / delta).toFixed(1)}`;

    this.coords.innerText = `Position { x: ${position[0].toFixed(1)}, y: ${position[1].toFixed(
      1
    )}, z: ${position[2].toFixed(1)} }`;

    // const neighbours = this.blz.chunkController.getChunkNeighbours(chunk);
    // const emptyNeighbours = Object.keys(neighbours).map((k) => {
    //   if (neighbours[k] && neighbours[k][0] === 0) return k;
    // });
    // this.chunk.innerText = `Chunk { x: ${chunk.x}, y: ${chunk.y}, isEmpty: ${
    //   this.blz.chunkController.chunks[`${chunk.x} ${chunk.y}`] &&
    //   this.blz.chunkController.chunks[`${chunk.x} ${chunk.y}`][0] === 0
    // }, emptyNs: ${emptyNeighbours} }`;
    this.chunk.innerText = `Chunk { x: ${chunk.x}, y: ${chunk.y} }`;

    this.chunks.innerText = `Chunks { loaded: ${
      Object.keys(this.blz.chunkController.chunks).length
    }, drawn: ${this.blz.chunkController.drawn} }`;

    this.queued.innerText = `Queued { render: ${this.blz.chunkController.renderQueue.length}, geometry: ${this.blz.chunkController.queue.length} }`;

    this.camera.innerText = `Camera { yaw: ${((player.getRotation()[1] / Math.PI) * 180).toFixed(2)} }`;

    // const frustum = player.camera.frustum;
    // this.frustum.innerText = `Frustum: { \n__${frustum.planeKeys
    //   .map((k) => {
    //     const plane = frustum.planes[k];
    //     return `${k[0]}: {${Object.keys(plane).reduce((acc, c) => {
    //       // @ts-expect-error
    //       acc += `${c}: ${plane[c].toFixed(2)},`;
    //       return acc;
    //     }, "")}}`;
    //   })
    //   .join("\n__")} \n}`;
  }

  dispose() {
    document.body.removeChild(this.container);
  }

  private createText() {
    const text = document.createElement("p");
    text.setAttribute("style", "font-family: monospace; font-size: .8rem; color: white;  margin: 4px 0;");
    this.container.appendChild(text);
    return text;
  }
}
