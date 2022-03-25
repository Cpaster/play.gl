// #version 300 es

// in vec3 a_vertexPosition;
// in vec2 a_textureCoord;

// out vec2 vTextureCoord;

// void main() {
//   vTextureCoord = a_textureCoord;
//   gl_Position = vec4(a_vertexPosition, 1.0);
// }

attribute vec3 a_vertexPosition;
attribute vec2 a_textureCoord;

varying vec2 vTextureCoord;

void main() {
  gl_PointSize = 1.0;
  gl_Position = vec4(a_vertexPosition, 1);
  
  vTextureCoord = a_textureCoord;
}