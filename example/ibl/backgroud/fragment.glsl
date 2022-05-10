#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

uniform samplerCube environmentMap1;

in vec3 vTextureCoord;

out vec4 FragColor;

void main() {

  vec3 envColor = texture(environmentMap1, vTextureCoord).rgb;
    
  // HDR tonemap and gamma correct
  envColor = envColor / (envColor + vec3(1.0));
  envColor = pow(envColor, vec3(1.0/2.2)); 
    
  FragColor = vec4(envColor, 1.0);
}