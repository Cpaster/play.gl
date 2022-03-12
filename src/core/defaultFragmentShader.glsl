#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

in vec3 FragPos;

in vec2 vTextureCoord;

out vec4 FragColor;

uniform sampler2D wall;

uniform vec4 color;

void main() {
  vec2 color = texture(wall, vTextureCoord).rg;
  FragColor = vec4(color.r, color.g, 0.0, 1.0);
  // FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}

// #ifdef GL_ES
// precision mediump float;
// #endif

// uniform sampler2D wall;

// uniform vec4 color;

// varying vec2 vTextureCoord;

// void main() {
//   gl_FragColor = texture2D(wall, vTextureCoord);
// }