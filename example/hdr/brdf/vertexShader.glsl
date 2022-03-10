#version 300 es

in vec3 a_vertexPosition;
in vec2 a_textureCoord;

out vec2 TexCoords;

void main() {
  TexCoords = a_textureCoord;
  gl_Position = vec4(a_vertexPosition, 1.0);
}