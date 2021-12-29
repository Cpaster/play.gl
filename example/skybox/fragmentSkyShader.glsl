#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

uniform samplerCube skybox;

in vec3 vTextureCoord;

out vec4 FragColor;

void main() {
  // gl_FragColor = textureCube(skybox, vTextureCoord);
  FragColor = texture(skybox, vTextureCoord);
  // gl_FragColor = vec4(1.0);
}