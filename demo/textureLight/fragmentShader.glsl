#ifdef GL_ES
precision highp float;
#endif
struct Material {
  sampler2D diffuse;
  sampler2D specular;
  vec3 ambient;
  float shininess;
};

struct Light {
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

uniform Material material;
uniform Light light;

uniform vec3 viewPosition;
uniform mat4 normalModel;
varying vec3 normal;
varying vec3 FragPos;
varying vec2 vTextureCoord;

void main() {

  vec3 amibent = light.ambient * texture2D(material.diffuse, vTextureCoord).rgb;

  vec3 norm = normalize(normal);
  vec3 lightDirection = normalize(light.position - FragPos);

  // diffuse
  float diff = max(dot(lightDirection, norm), 0.0);
  vec3 diffuse = light.diffuse * ( diff * texture2D(material.diffuse, vTextureCoord).rgb );

  // specular
  vec3 viewDir = normalize(viewPosition - FragPos);
  vec3 reflectDir = reflect(-lightDirection, norm);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
  vec3 specular = light.specular * (spec * texture2D(material.specular, vTextureCoord).rgb);
  
  gl_FragColor = vec4((diffuse + amibent + specular), 1.0);
}