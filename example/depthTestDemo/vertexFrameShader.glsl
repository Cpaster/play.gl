attribute vec3 a_vertexPosition;
attribute vec2 a_textureCoord;

varying vec2 vTextureCoord;

void main() {
  gl_PointSize = 1.0;
  gl_Position = vec4(a_vertexPosition.x, a_vertexPosition.y, 0, 1.0);
  vTextureCoord = a_textureCoord;
}