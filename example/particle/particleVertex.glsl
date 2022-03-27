attribute vec3 a_vertexPosition;
attribute vec2 a_textureCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform vec3 offset;

varying vec2 vTextureCoord;

void main() {
  float scale = 1.0;
  gl_PointSize = 1.0;

  vTextureCoord = a_textureCoord;

  gl_Position = projection * view * model * vec4((a_vertexPosition * scale) + offset, 1);
}