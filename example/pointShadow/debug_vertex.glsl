attribute vec3 a_vertexPosition;
attribute vec2 a_textureCoord;
attribute vec3 aNormal;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projectionMatrix[6];

varying vec3 FragPos;

void main()
{
  FragPos = vec3(model * vec4(a_vertexPosition, 1.0));
  gl_Position = projection * view * vec4(FragPos, 1.0);
}