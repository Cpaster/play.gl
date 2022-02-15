#version 300 es

in vec3 a_vertexPosition;
in vec3 aNormal;
in vec2 a_textureCoord;
in mat4 aInstanceMatrix;

// uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 normal;
out vec3 FragPos;

out vec2 vTextureCoord;

void main()
{
  FragPos = vec3(aInstanceMatrix * vec4(a_vertexPosition, 1.0));
  normal = transpose(inverse(mat3(aInstanceMatrix))) * aNormal;
  vTextureCoord = a_textureCoord;
  
  gl_PointSize = 1.0;
  gl_Position = projection * view * aInstanceMatrix * vec4(a_vertexPosition, 1);
}