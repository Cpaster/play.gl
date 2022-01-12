#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D diffuseTexture;
uniform samplerCube shadowMap;
uniform vec2 textureSize;
uniform vec3 color;
uniform vec3 lightPos;
uniform float far_plane;

uniform vec3 samply_arr[20];

uniform vec3 viewPos;

varying vec3 FragPos;
varying vec3 Normal;
varying vec2 TexCoords;
varying vec4 FragPosLightSpace;

float ShadowCalculation(vec4 fragPosLightSpace){
  vec3 projCoords = fragPosLightSpace.xyz;
  vec3 fragToLight = projCoords - lightPos;
  float currentDepth = length(fragToLight);
  float shadow = 0.0;
  float bias = 0.15;
  float viewDistance = length(viewPos - projCoords);
  float diskRadius = (1.0 + (viewDistance)) / 25.0;
  for (int i = 0; i <= 20; ++i) {
      float closestDepth = textureCube(shadowMap, fragToLight + samply_arr[i] * diskRadius).r;
      closestDepth *= far_plane;
      if(currentDepth - bias > closestDepth)
        shadow += 1.0;
  }

  shadow /= 20.0;

  return shadow;
}

void main()
{
    vec3 normal = normalize(Normal);
    vec3 lightColor = vec3(0.7);
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
    float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
    // calculate shadow
    float shadow = ShadowCalculation(FragPosLightSpace);
    // float shadow = 0.0;     
    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;    
    
    gl_FragColor = vec4(lighting, 1.0);
}