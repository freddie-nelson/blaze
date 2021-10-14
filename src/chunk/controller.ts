import Player from "../player";
import { ShaderProgramInfo } from "../renderer";
import { createShaderProgram } from "../utils/gl";
import ChunkGenerator from "./generator";
import GeometryGenerator from "./geometry";

import vsChunk from "../shaders/chunk/vertex.glsl";
import fsChunk from "../shaders/chunk/fragment.glsl";
import { mat4, vec3 } from "gl-matrix";

export interface RenderOptions {
  gl: WebGL2RenderingContext;
  player: Player;
  renderDist: number;
  queueLength: number;
}

export default class ChunkController {
  chunkGenerator: ChunkGenerator;
  geometryGenerator: GeometryGenerator;

  player: Player;
  renderDist: number;

  height = 255;
  size = 8;

  gl: WebGL2RenderingContext;
  shader: WebGLProgram;
  shaderProgramInfo: ShaderProgramInfo;

  queued = 0;
  maxQueued: number;
  chunks: { [index: string]: Uint8Array } = {};
  geometry: { [index: string]: { indices: Uint32Array; vertices: Float32Array } } = {};
  rendered: string[] = [];

  constructor(rOpts: RenderOptions) {
    this.gl = rOpts.gl;
    this.player = rOpts.player;
    this.renderDist = rOpts.renderDist;
    this.maxQueued = rOpts.queueLength;

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
        projectionMatrix: gl.getUniformLocation(this.shader, "uProjectionMatrix"),
        viewMatrix: gl.getUniformLocation(this.shader, "uViewMatrix"),
        modelMatrix: gl.getUniformLocation(this.shader, "uModelMatrix"),
      },
    };
  }

  update() {
    this.generateChunks();
    this.generateGeometry();
    this.renderChunks();
  }

  private generateChunks() {
    if (this.queued < this.maxQueued) {
      const canQueue = this.maxQueued - this.queued;
      this.queued = this.maxQueued;

      for (let i = 0; i < canQueue; i++) {
        const pos = this.getChunk(this.player.getPosition());
        const c = this.chunkGenerator.generateChunk(pos);
        const key = this.chunkKey(pos.x, pos.y);
        this.rendered.push(key);
        this.chunks[key] = c;
      }
    }
  }

  private generateGeometry() {
    for (const r of this.rendered) {
      if (!this.geometry[r]) {
        this.geometry[r] = this.geometryGenerator.convertGeoToTypedArrs(
          this.geometryGenerator.generateChunkGeometry(this.chunks[r])
        );
      }
    }
  }

  private renderChunks() {
    for (const r of this.rendered) {
      const geo = this.geometry[r];
      const gl = this.gl;

      const verticesBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, geo.vertices, gl.STATIC_DRAW);

      {
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
      }

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);
      console.log(geo.indices.length, geo.vertices.length);

      gl.useProgram(this.shaderProgramInfo.program);

      gl.uniformMatrix4fv(
        this.shaderProgramInfo.uniformLocations.projectionMatrix,
        false,
        this.player.camera.getProjectionMatrix()
      );
      gl.uniformMatrix4fv(
        this.shaderProgramInfo.uniformLocations.viewMatrix,
        false,
        this.player.camera.getViewMatrix()
      );
      const modelMatrix = mat4.create();
      gl.uniformMatrix4fv(this.shaderProgramInfo.uniformLocations.modelMatrix, false, modelMatrix);

      const offset = 0;
      const type = gl.UNSIGNED_INT;
      gl.drawElements(gl.TRIANGLES, geo.indices.length, type, offset);

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
    const x = Math.floor(position[0] / this.size + 0);
    const y = Math.floor(position[2] / this.size + 0);

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
