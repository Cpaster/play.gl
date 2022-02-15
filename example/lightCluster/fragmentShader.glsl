#ifdef GL_ES
precision highp float;
#endif

#define MAX_LIGHT_NUM 1

struct Material {
  sampler2D diffuse;
  sampler2D specular;
  vec3 ambient;
  float shininess;
};

struct DirectionLight {
  vec3 direction;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

struct PointLight {
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float constant;
  float linear;
  float quadratic;
};

struct SpotLight {
  vec3 position;
  vec3 direction;
  float cutOff;
  float outCutOff;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

uniform int directionNumber;
uniform int pointLightNumber;
uniform int spotLightNumber;

uniform Material material;
uniform DirectionLight directionLight[10];
uniform PointLight pointLight[10];
uniform SpotLight spotLight[10];

uniform vec3 viewPosition;
uniform mat4 normalModel;
varying vec3 normal;
varying vec3 FragPos;
varying vec2 vTextureCoord;

vec3 calcDirLight (DirectionLight light, vec3 normal, vec3 viewDir) {
  vec3 lightDir = normalize(-light.direction);
  float diff = max(dot(lightDir, normal), 0.0);
  vec3 diffuse = light.diffuse * diff * materialColor;
  vec3 ambient = light.ambient * materialColor;

  vec3 halfwayDir = normalize(lightDir + viewDir);
  
  float spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
  vec3 specular = light.specular * spec * materialColor;

  return ambient + diffuse + specular;
}

vec3 calcPointLight (PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
  vec3 lightDir = normalize(light.position - fragPos);
  float diff = max(dot(lightDir, normal), 0.0);
  vec3 diffuse = light.diffuse * diff * materialColor;
  vec3 ambient = light.ambient * materialColor;

  vec3 halfwayDir = normalize(lightDir + viewDir);
  
  float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
  vec3 specular = light.specular * spec * materialColor;

  float distance = length(light.position - fragPos);
  float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * distance * distance);

  return (ambient + specular + diffuse) * attenuation;
}

vec3 calcSpotLight (SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
  vec3 lightDir = normalize(light.position - fragPos);
  float diff = max(dot(lightDir, normal), 0.0);
  vec3 diffuse = light.diffuse * diff * texture2D(material.diffuse, vTextureCoord).rgb;
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(dot(reflectDir, viewDir), material.shininess);
  vec3 specular = light.specular * spec * texture2D(material.specular, vTextureCoord).rgb;
  vec3 ambient = light.ambient * texture2D(material.diffuse, vTextureCoord).rgb;

  float theta = dot(lightDir, normalize(light.direction));
  float epsilon = light.cutOff - light.outCutOff;
  float intensity = clamp((theta - light.outCutOff) / epsilon, 0.0, 1.0);

  return (ambient + specular + diffuse) * intensity;
}

void main() {

  vec3 norm = normalize(normal);
  vec3 viewDir = normalize(viewPosition - FragPos);

  vec3 result = vec3(0.0, 0.0, 0.0);
  
  for(int i = 0; i < MAX_LIGHT_NUM; i++) {
    result += calcDirLight(directionLight[i], norm, viewDir);
  }

  for(int j = 0; j < MAX_LIGHT_NUM; j++) {
    result += calcPointLight(pointLight[j], norm, FragPos, viewDir);
  }

  for(int k = 0; k < MAX_LIGHT_NUM; k++) {
    result += calcSpotLight(spotLight[k], norm, FragPos, viewDir);
  }

  gl_FragColor = vec4(result, 1.0);
}