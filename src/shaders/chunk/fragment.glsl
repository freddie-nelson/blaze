#version 300 es
precision highp float;

in float vNormal;
in vec2 vTexCoord;

uniform sampler2D uTexture;

out vec4 outColor;

void main() {
  outColor = vNormal * texture(uTexture, vTexCoord);
  if (outColor.a == 0.0f) discard;

  outColor.a = 1.0;
}