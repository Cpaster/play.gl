#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D font;
uniform vec4 color;

varying vec2 vTextureCoord;

void main() {
  gl_FragColor = texture2D(font, vTextureCoord) * color;
}