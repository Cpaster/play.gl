attribute vec3 a_vertexPosition;
// attribute vec2 a_textureCoord;
attribute vec3 aNormal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform mat4 normalModel;

// varying vec2 vTextureCoord;
varying vec3 normal;
varying vec3 FragPos;

void main() {
  normal = mat3(normalModel) * aNormal;
  // vTextureCoord = a_textureCoord;
  FragPos = vec3(model * vec4(a_vertexPosition, 1.0));

  gl_PointSize = 1.0;
  gl_Position = projection * view * model * vec4(a_vertexPosition, 1);
}