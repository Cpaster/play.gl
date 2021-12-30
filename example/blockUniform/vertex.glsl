#version 300 es
layout (location = 0) in vec3 a_vertexPosition;

layout (std140) uniform Matrices
{
  float test;
  mat4 view;
  mat4 projection;
};
uniform mat4 model;

void main()
{
  gl_Position = test * projection * view * model * vec4(a_vertexPosition, 1.0);
}  