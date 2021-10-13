import { mat4 } from "gl-matrix";
import { clear, createShaderProgram } from "./utils/gl";
import vsCube from "./shaders/cube/vertex.glsl";
import fsCube from "./shaders/cube/fragment.glsl";

/**
 * Creates the webgl2 rendering context for the canvas
 * Also resizes the canvas to fit the window and clears the webgl buffer
 *
 * @throws When browser does not support webgl 2
 *
 * @param canvas
 * @returns Webgl 2 rendering context for **canvas**
 */
export function BLZ_CreateRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("Your browser does not support WebGL 2.0");

  BLZ_ResizeRendererToWindow(gl);
  clear(gl);

  return gl;
}

/**
 * Resizes the canvas attached to **gl** to the window size and updates the **gl** viewport
 *
 * @param gl
 */
export function BLZ_ResizeRendererToWindow(gl: WebGL2RenderingContext) {
  gl.canvas.width = window.innerWidth;
  gl.canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

export function BLZ_RenderCube(gl: WebGL2RenderingContext, projectionMatrix: mat4, viewMatrix: mat4) {
  const shaderProgram = createShaderProgram(gl, vsCube, fsCube);
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      viewMatrix: gl.getUniformLocation(shaderProgram, "uViewMatrix"),
      modelMatrix: gl.getUniformLocation(shaderProgram, "uModelMatrix"),
    },
  };

  const positions = [
    // Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
  ];

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;

    const offset = 0;
    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

  const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
  ];

  const modelMatrix = mat4.create();

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix);

  const offset = 0;
  const type = gl.UNSIGNED_SHORT;
  const vertexCount = 36;
  gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
}
