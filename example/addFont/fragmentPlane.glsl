#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D font;

// uniform sampler2D wall;

uniform vec4 color;

varying vec2 vTextureCoord;

void main() {
  gl_FragColor = texture2D(font, vTextureCoord);
  // vec4 textureCol = texture2D(texture, vTextureCoord);
  // float w = textureCol.a;
  // if (w != 0.0) {
  //   gl_FragColor = textureCol;
  // } else {
  //   gl_FragColor = texture2D(wall, vTextureCoord);
  // }
}