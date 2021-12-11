attribute vec3 a_vertexPosition;
attribute vec3 aNormal;

uniform mat4 model;
uniform mat4 normalModel;
uniform mat4 view;
uniform mat4 projection;

varying vec3 normal;
varying vec3 FragPos;

void main() {
  gl_PointSize = 1.0;
  FragPos = vec3(model * vec4(a_vertexPosition, 1.0));
  gl_Position = projection * view * vec4(FragPos, 1.0);
  normal = mat3(normalModel) * aNormal;
}