#version 300 es

in vec3 a_vertexPosition;
// attribute vec2 a_textureCoord;
in vec3 aNormal;
in mat4 aInstanceMatrix;
in mat4 aInstanceNormalMatrix;

// uniform mat4 model;
uniform mat4 view;

layout (std140) uniform Matrices {
  mat4 projection;
};

uniform mat4 normalModel;
// uniform mat4 projection;

out vec3 normal;
out vec3 FragPos;

void main() {
  normal = mat3(aInstanceNormalMatrix) * aNormal;
  // vTextureCoord = a_textureCoord;
  FragPos = vec3(aInstanceMatrix * vec4(a_vertexPosition, 1.0));

  gl_PointSize = 1.0;
  gl_Position = projection * view * aInstanceMatrix * vec4(a_vertexPosition, 1);
}