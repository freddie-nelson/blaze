import Player from "../player";
import { createShaderProgram, ShaderProgramInfo } from "../utils/gl";
import ChunkGenerator from "./generator";
import GeometryGenerator from "./geometry";

import vsChunk from "../shaders/chunk/vertex.glsl";
import fsChunk from "../shaders/chunk/fragment.glsl";
import { mat4, vec2, vec3 } from "gl-matrix";
import { Neighbours } from "../voxel";
import Box from "../physics/box";
import Tilesheet from "../tilesheet";
import ThreadPool from "../threading/threadPool";

export interface ChunkControllerOptions {
  gl: WebGL2RenderingContext;
  player: Player;
  renderDist: number;
  worldSize: number;
  maxChunksPerTick: number;
  bedrock: number;
  chunkSize?: number;
  chunkHeight?: number;
}

export interface Limits {
  lowerX: number;
  iterationsX: number;
  lowerY: number;
  iterationsY: number;
}

export interface ChunkGeometry {
  indices: Uint32Array;
  vertices: Uint32Array;
}

export default class ChunkController {
  threadPool: ThreadPool;
  chunkGenerator: ChunkGenerator;
  geometryGenerator: GeometryGenerator;

  player: Player;

  height = 255;
  size = 8;
  bedrock: number;

  worldSize: number;
  renderDist: number;
  generationDist: number;
  chunkOffset: number;
  renderOffset: number;
  generationOffset: number;

  gl: WebGL2RenderingContext;
  shader: WebGLProgram;
  shaderProgramInfo: ShaderProgramInfo;
  tilesheet: Tilesheet;

  queue: { x: number; y: number }[] = [];
  lastCenter: { x: number; y: number } = { x: NaN, y: NaN };
  maxChunksPerTick: number;

  chunks: { [index: string]: Uint8Array } = {};
  geometry: { [index: string]: ChunkGeometry } = {};
  pendingGeometry: { [index: string]: boolean } = {};
  replaceGeometry: { [index: string]: boolean } = {};
  // buffers: { [index: string]: { indices: WebGLBuffer; vertices: WebGLBuffer } } = {};
  renderQueue: string[] = [];
  renderQueueMax: number;
  drawn = 0;
  drawMode = WebGL2RenderingContext.TRIANGLES;

  constructor(opts: ChunkControllerOptions, threadPool?: ThreadPool) {
    // validation checks
    if (opts.chunkSize && (opts.chunkSize < 1 || opts.chunkSize > 15))
      throw new Error("Chunk Controller: chunk size must be between 1 and 15 inclusive.");
    if (opts.chunkHeight && (opts.chunkHeight < 1 || opts.chunkHeight > 1023))
      throw new Error("Chunk Controller: chunk height must be between 1 and 1023 inclusive.");

    this.gl = opts.gl;
    this.player = opts.player;
    this.generationDist = opts.renderDist + 2;
    this.renderDist = opts.renderDist;
    this.maxChunksPerTick = opts.maxChunksPerTick;
    this.worldSize = opts.worldSize;
    this.bedrock = opts.bedrock;
    if (opts.chunkSize) this.size = opts.chunkSize;
    if (opts.chunkHeight) this.height = opts.chunkHeight;

    this.chunkOffset = Math.floor(this.worldSize / 2);
    this.renderOffset = Math.floor(this.renderDist / 2);
    this.generationOffset = Math.floor(this.generationDist / 2);
    this.renderQueueMax = this.renderDist * this.renderDist;

    this.chunkGenerator = new ChunkGenerator({ height: this.height, size: this.size });
    this.geometryGenerator = new GeometryGenerator({
      chunkSize: this.size,
      chunkHeight: this.height,
    });

    this.threadPool = threadPool;
    threadPool.everyThread({
      task: "init-geometry-generator",
      data: new Uint16Array([this.size, this.height]),
      // cb: () => console.log("init-geometry-generator"),
    });

    this.setupShader(this.gl);
  }

  setupShader(gl: WebGL2RenderingContext) {
    this.shader = createShaderProgram(gl, vsChunk, fsChunk);
    this.shaderProgramInfo = {
      program: this.shader,
      attribLocations: {
        vertex: gl.getAttribLocation(this.shader, "aVertex"),
      },
      uniformLocations: {
        projectionViewMatrix: gl.getUniformLocation(this.shader, "uProjectionViewMatrix"),
        modelMatrix: gl.getUniformLocation(this.shader, "uModelMatrix"),
        texture: gl.getUniformLocation(this.shader, "uTexture"),
        numOfTiles: gl.getUniformLocation(this.shader, "uNumOfTiles"),
      },
    };
  }

  update() {
    const center = this.getChunk(this.player.getPosition());
    if (this.lastCenter.x !== center.x || this.lastCenter.y !== center.y) {
      this.lastCenter = center;

      this.queueChunks(center);
    }

    this.generateChunks();

    const renderLimits = {
      lowerX: center.x - this.renderOffset,
      iterationsX: this.renderDist,
      lowerY: center.y - this.renderOffset,
      iterationsY: this.renderDist,
    };

    this.generateGeometry(renderLimits);
    this.renderChunks();
  }

  /**
   * Queues chunks for generation around **center**
   * Uses modified BFS algorithm to produce queue with chunks ordered by distance from **center**
   *
   * @param center center of generation algorithm
   */
  private queueChunks(center: { x: number; y: number }) {
    const start = { x: center.x - this.chunkOffset, y: center.y - this.chunkOffset };
    const startVec = vec2.fromValues(start.x, start.y);
    const maxDist = this.generationDist / 1.5;

    const queue = [start];
    const needsGeneration = [];
    if (!this.chunks[this.chunkKey(start.x, start.y)]) needsGeneration.push(start);

    let offset = 0;
    while (true) {
      const current = queue[offset];

      const ns = [];
      ns.push({ x: current.x - 1, y: current.y });
      ns.push({ x: current.x + 1, y: current.y });
      ns.push({ x: current.x, y: current.y - 1 });
      ns.push({ x: current.x, y: current.y + 1 });

      for (const n of ns) {
        if (queue.findIndex((c) => c.x === n.x && c.y === n.y) === -1) {
          if (this.chunks[this.chunkKey(n.x, n.y)]) queue.push(n);
          else {
            queue.push(n);
            needsGeneration.push(n);
          }
        }
      }

      offset++;
      const dist = vec2.dist(vec2.fromValues(queue[queue.length - 1].x, queue[queue.length - 1].y), startVec);
      if (offset >= queue.length || dist >= maxDist) break;
    }

    this.queue = needsGeneration;
  }

  private generateChunks() {
    const generated: string[] = [];

    for (let i = 0; i < this.maxChunksPerTick && this.queue.length !== 0; i++) {
      const pos = this.queue.shift();
      const key = this.chunkKey(pos.x, pos.y);

      if (
        this.chunks[key] ||
        pos.x <= this.chunkOffset * -1 ||
        pos.x > this.chunkOffset ||
        pos.y <= this.chunkOffset * -1 ||
        pos.y > this.chunkOffset
      )
        continue;

      const c = this.chunkGenerator.generateChunk(pos);
      this.chunks[key] = c;
      generated.push(key);
    }

    return generated;
  }

  /**
   * Generates geometry for every chunk that requires it within the provided limits.
   *
   * Replacement geometry is always generated on the main thread.
   *
   * @param limits
   */
  private generateGeometry(limits: Limits) {
    this.renderQueue = [];

    for (let y = limits.lowerY; y < limits.lowerY + limits.iterationsY; y++) {
      for (let x = limits.lowerX; x < limits.lowerX + limits.iterationsX; x++) {
        const pos = { x: x - this.chunkOffset, y: y - this.chunkOffset };
        const k = this.chunkKey(pos.x, pos.y);

        if (!this.geometry[k] || this.replaceGeometry[k]) {
          const pos = this.chunkPos(k);
          const neighbours = this.getChunkNeighbours(pos);

          if (this.replaceGeometry[k]) {
            delete this.pendingGeometry[k];
            delete this.replaceGeometry[k];

            this.geometry[k] = this.geometryGenerator.convertGeoToTypedArrs(
              this.geometryGenerator.generateChunkGeometry(this.chunks[k], neighbours)
            );
          } else if (
            !this.pendingGeometry[k] &&
            neighbours.left &&
            neighbours.right &&
            neighbours.front &&
            neighbours.back
          ) {
            if (this.threadPool) {
              this.pendingGeometry[k] = true;

              this.threadPool.requestThread({
                task: "chunk-geometry",
                data: { chunk: this.chunks[k], neighbours },
                cb: (geometry: ChunkGeometry) => {
                  // check if geometry was replaced while waiting
                  if (this.pendingGeometry[k]) {
                    this.geometry[k] = geometry;
                    delete this.pendingGeometry[k];
                  }
                },
              });
            } else {
              this.geometry[k] = this.geometryGenerator.convertGeoToTypedArrs(
                this.geometryGenerator.generateChunkGeometry(this.chunks[k], neighbours)
              );
            }
          } else {
            continue;
          }
        }

        this.renderQueue.push(k);
      }
    }
  }

  private renderChunks() {
    this.drawn = 0;
    for (const k of this.renderQueue) {
      // exit if geometry is still being generated on thread
      if (this.pendingGeometry[k]) continue;

      const geo = this.geometry[k];
      const gl = this.gl;

      // calculate chunk position matrix
      const modelMatrix = mat4.create();
      const position = this.chunkPos(k);
      const positionVec = vec3.fromValues(position.x * this.size, this.bedrock, position.y * this.size);
      mat4.translate(modelMatrix, modelMatrix, positionVec);

      // calculate projection view matrix
      const projectionViewMatrix = this.player.camera.getProjectionViewMatrix();

      // frustum cull
      if (!this.player.camera.frustum.containsBox(new Box(positionVec, this.size, this.height, this.size))) {
        continue;
      }
      this.drawn++;

      // buffer data
      const verticesBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, geo.vertices, gl.STATIC_DRAW);

      // console.log(geo.vertices[2].toString(2));

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);

      // bind vertex buffer to shader
      const numComponents = 1;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;

      gl.vertexAttribPointer(
        this.shaderProgramInfo.attribLocations.vertex,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(this.shaderProgramInfo.attribLocations.vertex);

      gl.useProgram(this.shaderProgramInfo.program);

      gl.uniformMatrix4fv(
        this.shaderProgramInfo.uniformLocations.projectionViewMatrix,
        false,
        projectionViewMatrix
      );
      gl.uniformMatrix4fv(this.shaderProgramInfo.uniformLocations.modelMatrix, false, modelMatrix);

      // set texture if tilesheet exists
      if (this.tilesheet) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.tilesheet.texture);
        gl.uniform1i(this.shaderProgramInfo.uniformLocations.texture, 0);
        gl.uniform1f(this.shaderProgramInfo.uniformLocations.numOfTiles, this.tilesheet.numOfTiles);
      }

      gl.drawElements(this.drawMode, geo.indices.length, gl.UNSIGNED_INT, 0);
    }
  }

  /**
   * Tells the controller to regenerate a chunk's geometry
   *
   * @param chunkLocation Position of chunk to refresh
   * @param refreshNeighbours Boolean representing wether the chunks neighbours should also be refreshed
   */
  refreshChunk({ x, y }: { x: number; y: number }, refreshNeighbours = false) {
    this.replaceGeometry[this.chunkKey(x, y)] = true;

    if (refreshNeighbours) {
      this.replaceGeometry[this.chunkKey(x - 1, y)] = true;
      this.replaceGeometry[this.chunkKey(x + 1, y)] = true;
      this.replaceGeometry[this.chunkKey(x, y - 1)] = true;
      this.replaceGeometry[this.chunkKey(x, y + 1)] = true;
    }
  }

  getChunkNeighbours({ x, y }: { x: number; y: number }) {
    const n = <Neighbours<Uint8Array>>{
      left: this.chunks[this.chunkKey(x - 1, y)],
      right: this.chunks[this.chunkKey(x + 1, y)],
      front: this.chunks[this.chunkKey(x, y - 1)],
      back: this.chunks[this.chunkKey(x, y + 1)],
    };

    // if (n.left && n.right && n.front && n.back) {
    //   console.log(x, y);
    //   console.log(n);
    // }

    return n;
  }

  /**
   * Gets the containing chunk's coordinates of a world position
   *
   * @param x
   * @param y
   * @param z
   * @returns
   */
  getChunk(position: vec3) {
    const x = Math.floor(position[0] / this.size + this.chunkOffset);
    const y = Math.floor(position[2] / this.size + this.chunkOffset);

    return {
      x,
      y,
    };
  }

  chunkKey(x: number, y: number) {
    return `${x} ${y}`;
  }

  chunkPos(key: string) {
    const split = key.split(" ");
    if (split.length !== 2)
      return {
        x: NaN,
        y: NaN,
      };
    else
      return {
        x: Number(split[0]),
        y: Number(split[1]),
      };
  }
}
