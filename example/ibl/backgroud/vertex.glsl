#version 300 es

in vec3 a_vertexPosition;

uniform mat4 view;
uniform mat4 projection;

out vec3 vTextureCoord;

void main() {
  vTextureCoord = a_vertexPosition;
  gl_PointSize = 1.0;
  vec4 pos = projection * view * vec4(a_vertexPosition, 1.0);
  gl_Position = pos.xyww;
}