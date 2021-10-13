import Blaze from "../src/blaze";
import { createShaderProgram } from "../src/utils/gl";
import { mat4 } from "gl-matrix";
import Camera from "../src/camera";

const blz = new Blaze(<HTMLCanvasElement>document.getElementById("canvas"));
const gl = blz.gl;

const vsSource = `
  attribute vec4 aVertexPosition;

  uniform mat4 uModelMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
  }
`;

const fsSource = `
  void main() {
    gl_FragColor = vec4(0, 1.0, 0, 1.0);
  }
`;

const shaderProgram = createShaderProgram(gl, vsSource, fsSource);
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

const camera = new Camera(gl);
camera.moveForward(-3);

const modelMatrix = mat4.create();

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

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

gl.useProgram(programInfo.program);

gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, camera.getProjectionMatrix());
gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, camera.getViewMatrix());
gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix);

const offset = 0;
const type = gl.UNSIGNED_SHORT;
const vertexCount = 36;
gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
