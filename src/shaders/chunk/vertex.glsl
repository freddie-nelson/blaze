#version 300 es

in highp float aVertex;

uniform mat4 uModelMatrix;
uniform mat4 uProjectionViewMatrix;
uniform float uNumOfTiles;

vec2 texCoords[4] = vec2[4](
  vec2(0.0f, 0.0f),
  vec2(1.0f, 0.0f),
  vec2(1.0f, 1.0f),
  vec2(0.0f, 1.0f)
);

out float vNormal;
out highp vec2 vTexCoord;
 
void main() {
  highp uint vertexData = floatBitsToUint(aVertex);
  float x = float((vertexData & 0x78000000u) >> 27u);
  float y = float((vertexData & 0x7FE0000u) >> 17u);
  float z = float((vertexData & 0x1E000u) >> 13u);

  vNormal = float((vertexData & 0x1C00u) >> 10u) / 5.0f;

  float tileId = float((vertexData & 0x3FCu) >> 2u) - 1.0f;
  uint uv = (vertexData & 0x3u);

  float padding = 0.0005f;

  // vNormal: 1 = top, 0.8 = left/right, 0.6 = front/back, 0.4 = bottom
  highp vec2 texCoord;
  if (vNormal == 0.4f) {
    texCoord.x = 2.0f/3.0f + padding;
  } else if (vNormal <= 0.8f) {
    texCoord.x = 1.0f/3.0f + padding;
  }

  float xOff = texCoords[uv].x/3.0f;
  if (texCoords[uv].x == 1.0f) {
    xOff -= padding * 2.0f;
  }

  texCoord.x += xOff;

  float tileSize = 1.0f / uNumOfTiles;
  float yOff = texCoords[uv].y * tileSize;
  if (texCoords[uv].y == 1.0f) {
    yOff -= padding * 2.0f;
  }

  texCoord.y = tileSize * tileId + padding + yOff;

  vTexCoord = texCoord;

  gl_Position = uProjectionViewMatrix * uModelMatrix * vec4(x, y, z, 1.0);
}