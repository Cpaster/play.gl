#version 300 es

in vec3 a_vertexPosition;

uniform mat4 view;
uniform mat4 projection;

out vec3 FragPos;

void main() {
  FragPos = a_vertexPosition;
  gl_Position = projection * view * vec4(a_vertexPosition, 1.0);
}