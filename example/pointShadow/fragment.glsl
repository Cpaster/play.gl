#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D diffuseTexture;
uniform samplerCube shadowMap;
uniform vec2 textureSize;
uniform vec3 color;

uniform vec3 lightPos;
uniform vec3 viewPos;

varying vec3 FragPos;
varying vec3 Normal;
varying vec2 TexCoords;
varying vec4 FragPosLightSpace;

float ShadowCalculation(vec4 fragPosLightSpace, float bias)
{
  vec2 texelSize = 1.0 / textureSize;
  float shadow = 0.0;
  vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
  projCoords = projCoords * 0.5 + 0.5;
  float currentDepth = projCoords.z;
  for(int x = -2; x <= 2; ++x) {
    for(int y = -2; y <= 2; ++y) {
      float pcfDepth = textureCube(shadowMap, vec3(1, 1, 1)).r; 
      shadow += (currentDepth - bias) > pcfDepth  ? 1.0 : 0.0;
    }
  }

  shadow /= 18.0;

  return shadow;
}

void main()
{
    // vec3 color = texture2D(diffuseTexture, TexCoords).rgb;
    vec3 normal = normalize(Normal);
    vec3 lightColor = vec3(0.6);
    // ambient
    vec3 ambient = 0.3 * lightColor;
    // diffuse
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * lightColor;
    // specular
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = 0.0;
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * lightColor;
    // float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
    // calculate shadow
    // float shadow = ShadowCalculation(FragPosLightSpace, bias);
    float shadow = 0.0;                      
    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;    
    
    gl_FragColor = vec4(lighting, 1.0);
    // gl_FragColor = vec4(vec3(shadow), 1.0);
}