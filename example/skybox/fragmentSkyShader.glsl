#ifdef GL_ES
precision mediump float;
#endif

uniform samplerCube skybox;

varying vec3 vTextureCoord;

void main() {
  gl_FragColor = textureCube(skybox, vTextureCoord);
  // gl_FragColor = vec4(1.0);
}