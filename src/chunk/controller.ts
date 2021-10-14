import Player from "../player";
import { ShaderProgramInfo } from "../renderer";
import { createShaderProgram } from "../utils/gl";
import ChunkGenerator from "./generator";
import GeometryGenerator from "./geometry";

import vsChunk from "../shaders/chunk/vertex.glsl";
import fsChunk from "../shaders/chunk/fragment.glsl";
import { mat4, vec3 } from "gl-matrix";

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

  height = 255;
  size = 8;
  bedrock: number;

  worldSize: number;
  renderDist: number;
  chunkOffset: number;
  chunkRenderOffset: number;

  gl: WebGL2RenderingContext;
  shader: WebGLProgram;
  shaderProgramInfo: ShaderProgramInfo;

  queue: { x: number; y: number }[] = [];
  maxChunksPerTick: number;

  chunks: { [index: string]: Uint8Array } = {};
  geometry: { [index: string]: { indices: Uint32Array; vertices: Float32Array } } = {};
  renderQueue: string[] = [];

  constructor(opts: ChunkControllerOptions) {
    this.gl = opts.gl;
    this.player = opts.player;
    this.renderDist = opts.renderDist;
    this.maxChunksPerTick = opts.maxChunksPerTick;
    this.worldSize = opts.worldSize;
    this.bedrock = opts.bedrock;

    this.chunkOffset = Math.floor(this.worldSize / 2);
    this.chunkRenderOffset = Math.floor(this.renderDist / 2);

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
    const renderLimits = {
      lowerX: center.x - this.chunkRenderOffset,
      iterationsX: this.renderDist,
      lowerY: center.y - this.chunkRenderOffset,
      iterationsY: this.renderDist,
    };

    this.queueChunks(renderLimits);

    const generated = this.generateChunks();
    this.generateGeometry(generated);

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
        this.renderQueue.splice(i, 1);
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
        this.geometry[k] = this.geometryGenerator.convertGeoToTypedArrs(
          this.geometryGenerator.generateChunkGeometry(this.chunks[k])
        );
      }

      this.renderQueue.push(k);
    }
  }

  private renderChunks() {
    for (const k of this.renderQueue) {
      const geo = this.geometry[k];
      const gl = this.gl;

      const verticesBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, geo.vertices, gl.STATIC_DRAW);

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

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);

      gl.useProgram(this.shaderProgramInfo.program);

      gl.uniformMatrix4fv(
        this.shaderProgramInfo.uniformLocations.projectionViewMatrix,
        false,
        this.player.camera.getProjectionViewMatrix()
      );

      // position chunk
      const modelMatrix = mat4.create();
      const position = this.chunkPos(k);
      mat4.translate(
        modelMatrix,
        modelMatrix,
        vec3.fromValues(position.x * this.size, this.bedrock, position.y * this.size)
      );
      gl.uniformMatrix4fv(this.shaderProgramInfo.uniformLocations.modelMatrix, false, modelMatrix);

      gl.drawElements(gl.TRIANGLES, geo.indices.length, gl.UNSIGNED_INT, 0);

      // gl.drawArrays(gl.TRIANGLES, 0, geo.vertices.length);
    }
  }

  /**
   * Gets the containing chunk's coordinates of a world position
   *
   * @param x
   * @param y
   * @param z
   * @returns
   */
  private getChunk(position: vec3) {
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
