#version 300 es

in float aVertex;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

vec2 texCoords[4] = vec2[4](
  vec2(0.0f, 0.0f),
  vec2(1.0f, 0.0f),
  vec2(1.0f, 1.0f),
  vec2(0.0f, 1.0f)
);

out vec3 normal;

void main() {
  highp uint vertexData = uint(aVertex);
  float x = float((vertexData & 0x1E000000u) >> 25u);
  float y = float((vertexData & 0x1FE0000u) >> 17u);
  float z = float((vertexData & 0x1E000u) >> 13u);

  normal = vec3(float((vertexData & 0x1C00u) >> 10u) / 5.0f);

  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(x, y, z, 1.0);
}