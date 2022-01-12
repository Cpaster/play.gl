attribute vec3 a_vertexPosition;
attribute vec2 a_textureCoord;
attribute vec3 aNormal;

uniform mat4 normalModel;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

uniform bool reverseNormal;

// uniform mat4 lightView;
// uniform mat4 lightProjection;
uniform mat4 lightSpaceMatrix;
uniform mat4 projectionMatrix[6];

varying vec3 FragPos;
varying vec3 Normal;
varying vec2 TexCoords;
varying vec4 FragPosLightSpace;

void main()
{
    FragPos = vec3(model * vec4(a_vertexPosition, 1.0));
    FragPosLightSpace = vec4(FragPos, 1.0);
    if (reverseNormal) {
      Normal = mat3(normalModel) * ( -1.0 * aNormal);
    } else {
      Normal = mat3(normalModel) * aNormal;
    }
    TexCoords = a_textureCoord;
    gl_Position = projection * view * vec4(FragPos, 1.0);
}