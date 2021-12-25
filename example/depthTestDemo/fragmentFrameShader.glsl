#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D screenTexture;

varying vec2 vTextureCoord;

void main() {
  vec4 col = texture2D(screenTexture, vTextureCoord);
  vec3 rgb = col.rgb;
  // if (a < 1.0) {
  //   gl_FragColor = vec4(1.0);
  // } else {
  gl_FragColor = vec4(rgb, 1.0);
  // }
}