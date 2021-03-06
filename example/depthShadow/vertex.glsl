attribute vec3 a_vertexPosition;
attribute vec2 a_textureCoord;
attribute vec3 aNormal;

uniform mat4 normalModel;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
// uniform float reverse_normal;

// uniform mat4 lightView;
// uniform mat4 lightProjection;
uniform mat4 lightSpaceMatrix;


varying vec3 FragPos;
varying vec3 Normal;
varying vec2 TexCoords;
varying vec4 FragPosLightSpace;

void main()
{
    FragPos = vec3(model * vec4(a_vertexPosition, 1.0));
    Normal = mat3(normalModel) * aNormal;
    TexCoords = a_textureCoord;
    FragPosLightSpace = lightSpaceMatrix * vec4(FragPos, 1.0);
    gl_Position = projection * view * model * vec4(a_vertexPosition, 1.0);
}