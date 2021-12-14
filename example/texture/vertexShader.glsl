attribute vec3 a_vertexPosition;
attribute vec2 a_textureCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec2 vTextureCoord;

void main() {
  gl_PointSize = 1.0;
  gl_Position = projection * view * model * vec4(a_vertexPosition, 1);
  
  vTextureCoord = a_textureCoord;
}