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

uniform PointLight pointLight[4];
uniform DirectionLight directionLight[1];
uniform vec3 viewPosition;

uniform samplerCube irradianceMap;

uniform vec3 albedo;
uniform float ao;

uniform vec3 materialColor;

in vec3 normal;
in vec3 FragPos;
in vec2 TexCoords;

in float metallic;
in float roughness;

out vec4 FragColor;

// vec3 calcDirLight (DirectionLight light, vec3 normal, vec3 viewDir) {
//   vec3 lightDir = normalize(-light.direction);
//   float diff = max(dot(lightDir, normal), 0.0);
//   vec3 diffuse = light.diffuse * diff * materialColor;
//   vec3 ambient = light.ambient * materialColor;

//   vec3 halfwayDir = normalize(lightDir + viewDir);
  
//   float spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
//   vec3 specular = light.specular * spec * materialColor;

//   return ambient + diffuse + specular;
// }

// vec3 calcPointLight (PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
//   vec3 lightDir = normalize(light.position - fragPos);
//   float diff = max(dot(lightDir, normal), 0.0);
//   vec3 diffuse = light.diffuse * diff * materialColor;
//   vec3 ambient = light.ambient * materialColor;

//   vec3 halfwayDir = normalize(lightDir + viewDir);
  
//   float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
//   vec3 specular = light.specular * spec * materialColor;

//   float distance = length(light.position - fragPos);
//   float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * distance * distance);

//   return (ambient + specular + diffuse) * attenuation;
// }

const float PI = 3.14159265359;
// ----------------------------------------------------------------------------
float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a = roughness*roughness;
    float a2 = a*a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
  vec3 N = normalize(normal);
  vec3 V = normalize(viewPosition - FragPos);

  vec3 F0 = vec3(0.04);
  F0 = mix(F0, albedo, metallic);

  vec3 Lo = vec3(0.0);

  for (int i = 0; i < 4; i++) {
    vec3 L = normalize(pointLight[i].position - FragPos);
    vec3 H = normalize(V + L);

    float distance = length(pointLight[0].position - FragPos);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = materialColor * attenuation;

    float NDF = DistributionGGX(N, H, roughness);
    float G   = GeometrySmith(N, V, L, roughness);
    vec3 F  = fresnelSchlick(clamp(dot(H, V), 0.0, 1.0), F0);

    vec3 numerator    = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001; // + 0.0001 to prevent divide by zero
    vec3 specular = numerator / denominator;

    // kS is equal to Fresnel
    vec3 kS = F;
    // for energy conservation, the diffuse and specular light can't
    // be above 1.0 (unless the surface emits light); to preserve this
    // relationship the diffuse component (kD) should equal 1.0 - kS.
    vec3 kD = vec3(1.0) - kS;
    // multiply kD by the inverse metalness such that only non-metals 
    // have diffuse lighting, or a linear blend if partly metal (pure metals
    // have no diffuse light).
    kD *= 1.0 - metallic;	  

    // scale light by NdotL
    float NdotL = max(dot(N, L), 0.0);        

    // add to outgoing radiance Lo
    Lo += (kD * albedo / PI + specular) * radiance * NdotL;
  }

  vec3 kS = fresnelSchlick(max(dot(N, V), 0.0), F0);
  vec3 kD = 1.0 - kS;
  kD *= 1.0 - metallic;

  vec3 irradiance = texture(irradianceMap, N).rgb;
  vec3 diffuse = irradiance * albedo;
  vec3 ambient = (kD * diffuse) * ao;

  vec3 color = ambient + Lo;

  // HDR tonemapping
  color = color / (color + vec3(1.0));
  // gamma correct
  color = pow(color, vec3(1.0/2.2)); 

  FragColor = vec4(color, 1.0);
}