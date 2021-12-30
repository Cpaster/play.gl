#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

out vec4 FragColor;
in vec3 fColor;

void main()
{
  FragColor = vec4(fColor, 1.0);
}