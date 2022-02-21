#version 300 es

in vec3 a_vertexPosition;
in vec3 aNormal;
in vec2 a_textureCoord;
in mat4 models;

uniform mat4 view;
uniform mat4 projection;

out vec3 normal;
out vec3 FragPos;

out vec2 TexCoords;

void main()
{
  FragPos = vec3(models * vec4(a_vertexPosition, 1.0));
  normal = transpose(inverse(mat3(models))) * aNormal;
  TexCoords = a_textureCoord;
  
  gl_PointSize = 1.0;
  gl_Position = projection * view * models * vec4(a_vertexPosition, 1);
}