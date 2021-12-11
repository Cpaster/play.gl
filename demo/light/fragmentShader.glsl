#ifdef GL_ES
precision highp float;
#endif

uniform vec3 objectColor;
uniform vec3 lightColor;
uniform vec3 lightPosition;
uniform float ambientStrength;
uniform vec3 viewPosition;

uniform mat4 normalModel;

varying vec3 normal;
varying vec3 FragPos;

void main() {
  vec3 amibent = ambientStrength * lightColor;
  vec3 norm = normalize(normal);
  vec3 lightDirection = normalize(lightPosition - FragPos);

  // diffuse
  float diff = max(dot(lightDirection, normal), 0.0);
  vec3 diffuse = diff * lightColor;

  // specular
  vec3 viewDir = normalize(viewPosition - FragPos);
  vec3 reflectDir = reflect(-lightDirection, norm);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 10.0);
  vec3 specular = 0.5 * spec * lightColor;
  
  gl_FragColor = vec4((diffuse + amibent + specular) * objectColor, 1.0);
}