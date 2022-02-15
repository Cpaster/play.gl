#version 300 es

in vec3 a_vertexPosition;
in vec3 aNormal;
in vec2 a_textureCoord;
in mat4 models;
in float metallics;
in float roughnesss;

// uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 normal;
out vec3 FragPos;
out float metallic;
out float roughness;

out vec2 vTextureCoord;

void main()
{
  metallic = metallics;
  roughness = roughnesss;
  FragPos = vec3(models * vec4(a_vertexPosition, 1.0));
  normal = transpose(inverse(mat3(models))) * aNormal;
  vTextureCoord = a_textureCoord;
  
  gl_PointSize = 1.0;
  gl_Position = projection * view * models * vec4(a_vertexPosition, 1);
}