#version 300 es

in highp float aVertex;

uniform mat4 uModelMatrix;
uniform mat4 uProjectionViewMatrix;


void main() {
  gl_Position = uProjectionViewMatrix * uModelMatrix * aVertexPosition;
}