#ifdef GL_ES
precision mediump float;
#endif

uniform samplerCube skybox;
uniform vec3 cameraPos;

// varying vec2 vTextureCoord;
varying vec3 normal;
varying vec3 FragPos;

void main() {
  float rotio = 1.0 / 1.52;
  vec3 I = normalize(FragPos - cameraPos);
  // vec3 R = reflect(I, normalize(normal));
  vec3 R = refract(I, normalize(normal), rotio);
  gl_FragColor = vec4(textureCube(skybox, R).rgb, 1.0);
}