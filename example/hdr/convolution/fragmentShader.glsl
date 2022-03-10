#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

out vec4 FragColor;
in vec3 FragPos;

uniform samplerCube environmentMap;

const float PI = 3.14159265359;

void main() {
  vec3 N = normalize(FragPos);

  vec3 irradiance = vec3(0.0);

  vec3 up    = vec3(0.0, 1.0, 0.0);
  vec3 right = normalize(cross(up, N));
  up = normalize(cross(N, right));

  float sampleDelta = 0.15;
  float nrSamples = 0.0;
  for(float phi = 0.0; phi < 2.0 * PI; phi += sampleDelta) {
    for(float theta = 0.0; theta < 0.5 * PI; theta += sampleDelta) {
      // spherical to cartesian (in tangent space)
      vec3 tangentSample = vec3(sin(theta) * cos(phi),  sin(theta) * sin(phi), cos(theta));
      // tangent space to world
      vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * N; 

      irradiance += texture(environmentMap, sampleVec).rgb * cos(theta) * sin(theta);
      nrSamples++;
    }
  }
    
  irradiance = PI * irradiance * (1.0 / float(nrSamples));
    
  FragColor = vec4(irradiance, 1.0);
}