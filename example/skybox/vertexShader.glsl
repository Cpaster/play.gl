#version 300 es

in vec3 a_vertexPosition;
// attribute vec2 a_textureCoord;
in vec3 aNormal;

uniform mat4 model;
uniform mat4 view;

layout (std140) uniform Matrices {
  float test;
  mat4 projection;
};

uniform mat4 normalModel;

out vec3 normal;
out vec3 FragPos;

void main() {
  normal = mat3(normalModel) * aNormal;
  // vTextureCoord = a_textureCoord;
  FragPos = vec3(model * vec4(a_vertexPosition, 1.0));

  gl_PointSize = 1.0;
  gl_Position = test * projection * view * model * vec4(a_vertexPosition, 1);
}