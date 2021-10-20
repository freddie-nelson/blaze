import Blaze from "./blaze";

export default class Debug {
  blz: Blaze;

  show = true;

  // elements
  container: HTMLDivElement;
  fps: HTMLSpanElement;
  coords: HTMLSpanElement;
  chunk: HTMLSpanElement;
  chunks: HTMLSpanElement;
  queued: HTMLSpanElement;
  camera: HTMLSpanElement;
  frustum: HTMLSpanElement;

  lineMode: HTMLInputElement;

  reloadChunks: HTMLButtonElement;
  showBtn: HTMLButtonElement;

  constructor(blz: Blaze) {
    this.blz = blz;

    const container = document.createElement("div");
    container.setAttribute(
      "style",
      "position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; background-color: rgba(0, 0, 0, 0.5); padding: 8px; border-radius: 4px; z-index: 2;"
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
    this.lineMode = this.createToggle("Draw Lines: ", (val) =>
      val
        ? (this.blz.chunkController.drawMode = WebGL2RenderingContext.LINES)
        : (this.blz.chunkController.drawMode = WebGL2RenderingContext.TRIANGLES)
    );
    this.reloadChunks = this.createButton("Reload Chunks", () => {
      this.blz.chunkController.geometry = {};
      this.blz.chunkController.pendingGeometry = {};
    });
    this.reloadChunks.id = "reload-btn";
    this.showBtn = this.createButton("Show/Hide Menu", () => {
      this.show = !this.show;

      const children = Array.from(this.container.children);
      if (!this.show) {
        children.forEach((element: HTMLElement) => {
          if (element === this.showBtn) return;

          element.style.display = "none";
        });
      } else {
        children.forEach((element: HTMLElement) => {
          if (element === this.showBtn) return;

          element.style.display = "block";
        });
      }
    });
  }

  update(delta: number) {
    if (!this.show) return;

    const player = this.blz.player;
    const position = player.getPosition();
    const chunk = this.blz.chunkController.getChunk(position);
    chunk.x -= this.blz.chunkController.chunkOffset;
    chunk.y -= this.blz.chunkController.chunkOffset;

    this.fps.textContent = `FPS: ${(1 / delta).toFixed(1)}`;

    this.coords.textContent = `Position { x: ${position[0].toFixed(1)}, y: ${position[1].toFixed(
      1
    )}, z: ${position[2].toFixed(1)} }`;

    // const neighbours = this.blz.chunkController.getChunkNeighbours(chunk);
    // const emptyNeighbours = Object.keys(neighbours).map((k) => {
    //   if (neighbours[k] && neighbours[k][0] === 0) return k;
    // });
    // this.chunk.textContent = `Chunk { x: ${chunk.x}, y: ${chunk.y}, isEmpty: ${
    //   this.blz.chunkController.chunks[`${chunk.x} ${chunk.y}`] &&
    //   this.blz.chunkController.chunks[`${chunk.x} ${chunk.y}`][0] === 0
    // }, emptyNs: ${emptyNeighbours} }`;
    this.chunk.textContent = `Chunk { x: ${chunk.x}, y: ${chunk.y} }`;

    this.chunks.textContent = `Chunks { loaded: ${
      Object.keys(this.blz.chunkController.chunks).length
    }, drawn: ${this.blz.chunkController.drawn} }`;

    this.queued.textContent = `Queued { render: ${this.blz.chunkController.renderQueue.length}, generation: ${this.blz.chunkController.queue.length} }`;

    this.camera.textContent = `Camera { yaw: ${((player.getRotation()[1] / Math.PI) * 180).toFixed(2)} }`;

    // const frustum = player.camera.frustum;
    // this.frustum.textContent = `Frustum: { \n__${frustum.planeKeys
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
    const text = document.createElement("span");
    text.setAttribute(
      "style",
      "font-family: monospace; font-size: .8rem; color: white; margin: 4px 0; width: 300px;"
    );
    this.container.appendChild(text);
    return text;
  }

  private createToggle(text: string, cb: (val: boolean) => void) {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.addEventListener("input", (e) => cb((e.target as HTMLInputElement).checked));
    const p = this.createText();
    p.textContent = text;
    p.style.display = "flex";
    p.style.alignItems = "center";
    p.style.marginTop = "-4px";
    box.style.marginLeft = "4px";
    p.appendChild(box);
    this.container.appendChild(p);
    return box;
  }

  private createButton(text: string, cb: () => void) {
    const btn = document.createElement("button");
    btn.setAttribute("style", "font-family: monospace; font-size: .8rem; color: black;  margin: 4px 0;");
    btn.innerText = text;
    btn.addEventListener("click", cb);
    this.container.appendChild(btn);
    return btn;
  }
}
