#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D texture1;

uniform vec4 color;

varying vec2 vTextureCoord;

void main() {
  gl_FragColor = texture2D(texture1, vTextureCoord);
}