import Player from "../player";
import { ShaderProgramInfo } from "../renderer";
import { createShaderProgram } from "../utils/gl";
import ChunkGenerator from "./generator";
import GeometryGenerator from "./geometry";

import vsChunk from "../shaders/chunk/vertex.glsl";
import fsChunk from "../shaders/chunk/fragment.glsl";
import { mat4, vec3, vec4 } from "gl-matrix";
import { Neighbours } from "../voxel";
import Box from "../physics/box";

export interface ChunkControllerOptions {
  gl: WebGL2RenderingContext;
  player: Player;
  renderDist: number;
  worldSize: number;
  maxChunksPerTick: number;
  bedrock: number;
}

export interface Limits {
  lowerX: number;
  iterationsX: number;
  lowerY: number;
  iterationsY: number;
}

export default class ChunkController {
  chunkGenerator: ChunkGenerator;
  geometryGenerator: GeometryGenerator;

  player: Player;

  height = 127;
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

  queue: { x: number; y: number }[] = [];
  lastCenter: { x: number; y: number } = { x: NaN, y: NaN };
  maxChunksPerTick: number;

  chunks: { [index: string]: Uint8Array } = {};
  geometry: { [index: string]: { indices: Uint32Array; vertices: Float32Array } } = {};
  // buffers: { [index: string]: { indices: WebGLBuffer; vertices: WebGLBuffer } } = {};
  renderQueue: string[] = [];
  renderQueueMax: number;
  drawn = 0;

  constructor(opts: ChunkControllerOptions) {
    this.gl = opts.gl;
    this.player = opts.player;
    this.generationDist = opts.renderDist + 2;
    this.renderDist = opts.renderDist;
    this.maxChunksPerTick = opts.maxChunksPerTick;
    this.worldSize = opts.worldSize;
    this.bedrock = opts.bedrock;

    this.chunkOffset = Math.floor(this.worldSize / 2);
    this.renderOffset = Math.floor(this.renderDist / 2);
    this.generationOffset = Math.floor(this.generationDist / 2);
    this.renderQueueMax = this.renderDist * this.renderDist;

    this.chunkGenerator = new ChunkGenerator({ height: this.height, size: this.size });
    this.geometryGenerator = new GeometryGenerator({
      chunkSize: this.size,
      chunkHeight: this.height,
      tileSize: 16,
      tileTextureHeight: 96,
      tileTextureWidth: 48,
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
      },
    };
  }

  update() {
    const center = this.getChunk(this.player.getPosition());
    if (
      this.lastCenter.x !== center.x ||
      this.lastCenter.y !== center.y ||
      this.renderQueue.length !== this.renderQueueMax
    ) {
      this.lastCenter = center;
      const generationLimits = {
        lowerX: center.x - this.generationOffset,
        iterationsX: this.generationDist,
        lowerY: center.y - this.generationOffset,
        iterationsY: this.generationDist,
      };

      this.queueChunks(generationLimits);
      this.cleanQueue(generationLimits);

      const generated = this.generateChunks();
      this.generateGeometry(generated);
    }

    const renderLimits = {
      lowerX: center.x - this.renderOffset,
      iterationsX: this.renderDist,
      lowerY: center.y - this.renderOffset,
      iterationsY: this.renderDist,
    };

    this.cleanRenderQueue(renderLimits);
    this.renderChunks();
  }

  private cleanRenderQueue(limits: Limits) {
    for (let i = this.renderQueue.length - 1; i >= 0; i--) {
      const pos = this.chunkPos(this.renderQueue[i]);
      pos.x += this.chunkOffset;
      pos.y += this.chunkOffset;
      if (
        pos.x < limits.lowerX ||
        pos.x >= limits.lowerX + limits.iterationsX ||
        pos.y < limits.lowerY ||
        pos.y >= limits.lowerY + limits.iterationsY
      ) {
        delete this.geometry[this.renderQueue[i]];
        // delete this.buffers[this.renderQueue[i]];
        this.renderQueue.splice(i, 1);
      }
    }
  }

  private cleanQueue(limits: Limits) {
    for (let i = this.queue.length - 1; i >= 0; i--) {
      const pos = { ...this.queue[i] };
      pos.x += this.chunkOffset;
      pos.y += this.chunkOffset;
      if (
        pos.x < limits.lowerX ||
        pos.x >= limits.lowerX + limits.iterationsX ||
        pos.y < limits.lowerY ||
        pos.y >= limits.lowerY + limits.iterationsY
      ) {
        this.queue.splice(i, 1);
      }
    }
  }

  private queueChunks(limits: Limits) {
    // queue chunks within player's render distance
    for (let y = limits.lowerY; y < limits.lowerY + limits.iterationsY; y++) {
      for (let x = limits.lowerX; x < limits.lowerX + limits.iterationsX; x++) {
        const pos = { x: x - this.chunkOffset, y: y - this.chunkOffset };
        const key = this.chunkKey(pos.x, pos.y);

        if (
          this.renderQueue.findIndex((k) => k === key) === -1 &&
          this.queue.findIndex((p) => p.x === pos.x && p.y === pos.y) === -1
        )
          this.queue.push(pos);
      }
    }
  }

  private generateChunks() {
    const generated: string[] = [];

    for (let i = 0; i < this.maxChunksPerTick && this.queue.length !== 0; i++) {
      const pos = this.queue.shift();
      const c = this.chunkGenerator.generateChunk(pos);
      const key = this.chunkKey(pos.x, pos.y);
      this.chunks[key] = c;
      generated.push(key);
    }

    return generated;
  }

  private generateGeometry(chunks: string[]) {
    for (const k of chunks) {
      if (!this.geometry[k]) {
        // console.log(k);
        const pos = this.chunkPos(k);
        const neighbours = this.getChunkNeighbours(pos);

        if (neighbours.left && neighbours.right && neighbours.front && neighbours.back) {
          this.geometry[k] = this.geometryGenerator.convertGeoToTypedArrs(
            this.geometryGenerator.generateChunkGeometry(this.chunks[k], neighbours)
          );
        } else {
          this.queue.push(pos);
          continue;
        }
      }

      this.renderQueue.push(k);
    }
  }

  private renderChunks() {
    this.drawn = 0;
    for (const k of this.renderQueue) {
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

      // position chunk

      gl.uniformMatrix4fv(this.shaderProgramInfo.uniformLocations.modelMatrix, false, modelMatrix);

      gl.drawElements(gl.TRIANGLES, geo.indices.length, gl.UNSIGNED_INT, 0);
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

  private chunkKey(x: number, y: number) {
    return `${x} ${y}`;
  }

  private chunkPos(key: string) {
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
