#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 a_vertexPosition;

uniform mat4 lightSpaceMatrix;
uniform mat4 model;

varying vec3 FragPos;

void main()
{
  FragPos = vec3(model * vec4(a_vertexPosition, 1.0));
  gl_Position = lightSpaceMatrix * vec4(FragPos, 1.0);
}