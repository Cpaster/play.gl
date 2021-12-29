#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

uniform samplerCube skybox;
uniform vec3 cameraPos;

// varying vec2 vTextureCoord;
in vec3 normal;
in vec3 FragPos;

out vec4 FragColor;

void main() {
  float rotio = 1.0 / 1.52;
  vec3 I = normalize(FragPos - cameraPos);
  // vec3 R = reflect(I, normalize(normal));
  vec3 R = refract(I, normalize(normal), rotio);
  FragColor = vec4(texture(skybox, R).rgb, 1.0);
}