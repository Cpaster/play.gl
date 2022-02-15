#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

struct PointLight {
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float constant;
  float linear;
  float quadratic;
};

struct DirectionLight {
  vec3 direction;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

uniform PointLight pointLight[1];
uniform DirectionLight directionLight[1];
uniform vec3 viewPosition;

uniform vec3 materialColor;

out vec4 FragColor;

in vec3 normal;
in vec3 FragPos;
in vec2 TexCoords;

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

void main()
{

  vec3 norm = normalize(normal);
  vec3 viewDir = normalize(viewPosition - FragPos);
  vec3 result = vec3(0.0, 0.0, 0.0);

  // for(int i = 0; i < 1; i++) {
    result += calcDirLight(directionLight[0], norm, viewDir);
  // }

  // for(int j = 0; j < 1; j++) {
    result += calcPointLight(pointLight[0], norm, FragPos, viewDir);
  // }
  FragColor = vec4(result, 1.0);
  // FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  // if (gl_FragCoord.z == 0.0) {
  //   FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  // } else {
  //   FragColor = vec4(0.0, 1.0, 0.0, 1.0);
  // }

  // FragColor = vec4(vec3(gl_FragCoord.z), 1.0);
}