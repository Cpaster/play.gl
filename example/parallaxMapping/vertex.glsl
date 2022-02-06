#version 300 es

in vec3 a_vertexPosition;
in vec3 aNormal;
in vec2 a_textureCoord;
in vec3 tangent;
in vec3 bitangent;


out vec3 FragPos;
out vec2 TexCoords;
out vec3 TangentLightPos;
out vec3 TangentViewPos;
out vec3 TangentFragPos;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

uniform vec3 lightPos;
uniform vec3 viewPos;

void main()
{
    gl_Position = projection * view * model * vec4(a_vertexPosition, 1.0);
    FragPos = vec3(model * vec4(a_vertexPosition, 1.0));   
    TexCoords = a_textureCoord;
    
    mat3 normalMatrix = transpose(inverse(mat3(model)));
    vec3 T = normalize(normalMatrix * tangent);
    vec3 B = normalize(normalMatrix * bitangent);
    vec3 N = normalize(normalMatrix * aNormal);   
    
    mat3 TBN = transpose(mat3(T, B, N));
    TangentLightPos = TBN * lightPos;
    TangentViewPos  = TBN * viewPos;
    TangentFragPos  = TBN * FragPos;
}