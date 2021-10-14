#version 300 es
precision highp float;

in vec3 normal;

out vec4 outColor;

void main() {
  vec3 color = vec3(0, 1.0, 0);

  outColor = vec4(color * normal, 1.0);
}