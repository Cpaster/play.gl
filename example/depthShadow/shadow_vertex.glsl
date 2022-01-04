#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 a_vertexPosition;
attribute vec3 aNormal;

uniform mat4 lightSpaceMatrix;
uniform mat4 model;

void main()
{
  gl_Position = lightSpaceMatrix * model * vec4(a_vertexPosition, 1.0);
}