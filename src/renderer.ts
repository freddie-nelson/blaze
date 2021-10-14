import { clear } from "./utils/gl";

export interface ShaderProgramInfo {
  program: WebGLProgram;
  attribLocations: {
    [index: string]: number;
  };
  uniformLocations: {
    projectionViewMatrix: WebGLUniformLocation;
    modelMatrix: WebGLUniformLocation;
  };
}

/**
 * Creates the webgl2 rendering context for the canvas
 * Also resizes the canvas to fit the window and clears the webgl buffer
 *
 * @throws When browser does not support webgl 2
 *
 * @param canvas
 * @returns Webgl 2 rendering context for **canvas**
 */
export function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("Your browser does not support WebGL 2.0");

  resizeRendererToWindow(gl);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.depthMask(true);
  clear(gl);

  return gl;
}

/**
 * Resizes the canvas attached to **gl** to the window size and updates the **gl** viewport
 *
 * @param gl
 */
export function resizeRendererToWindow(gl: WebGL2RenderingContext) {
  gl.canvas.width = window.innerWidth;
  gl.canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

// const positions = new Float32Array([
//   // Front face
//   -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

//   // Back face
//   -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

//   // Top face
//   -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

//   // Bottom face
//   -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

//   // Right face
//   1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

//   // Left face
//   -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
// ]);

// const indices = new Uint16Array([
//   0,
//   1,
//   2,
//   0,
//   2,
//   3, // front
//   4,
//   5,
//   6,
//   4,
//   6,
//   7, // back
//   8,
//   9,
//   10,
//   8,
//   10,
//   11, // top
//   12,
//   13,
//   14,
//   12,
//   14,
//   15, // bottom
//   16,
//   17,
//   18,
//   16,
//   18,
//   19, // right
//   20,
//   21,
//   22,
//   20,
//   22,
//   23, // left
// ]);

// let cubeProgram: WebGLProgram;
// let cubeProgramInfo: any;

// export function renderCube(gl: WebGL2RenderingContext, projectionMatrix: mat4, viewMatrix: mat4) {
//   if (!cubeProgram) {
//     cubeProgram = createShaderProgram(gl, vsCube, fsCube);
//     cubeProgramInfo = {
//       program: cubeProgram,
//       attribLocations: {
//         vertexPosition: gl.getAttribLocation(cubeProgram, "aVertexPosition"),
//       },
//       uniformLocations: {
//         projectionMatrix: gl.getUniformLocation(cubeProgram, "uProjectionMatrix"),
//         viewMatrix: gl.getUniformLocation(cubeProgram, "uViewMatrix"),
//         modelMatrix: gl.getUniformLocation(cubeProgram, "uModelMatrix"),
//       },
//     };
//   }

//   const positionBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

//   {
//     const numComponents = 3;
//     const type = gl.FLOAT;
//     const normalize = false;
//     const stride = 0;

//     const offset = 0;
//     // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//     gl.vertexAttribPointer(
//       cubeProgramInfo.attribLocations.vertexPosition,
//       numComponents,
//       type,
//       normalize,
//       stride,
//       offset
//     );
//     gl.enableVertexAttribArray(cubeProgramInfo.attribLocations.vertexPosition);
//   }

//   const modelMatrix = mat4.create();
//   mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(3, 0, 0));

//   const indexBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
//   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

//   gl.useProgram(cubeProgramInfo.program);

//   gl.uniformMatrix4fv(cubeProgramInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
//   gl.uniformMatrix4fv(cubeProgramInfo.uniformLocations.viewMatrix, false, viewMatrix);
//   gl.uniformMatrix4fv(cubeProgramInfo.uniformLocations.modelMatrix, false, modelMatrix);

//   const offset = 0;
//   const type = gl.UNSIGNED_SHORT;
//   const vertexCount = 36;
//   gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
// }
