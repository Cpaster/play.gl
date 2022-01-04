attribute vec3 a_vertexPosition;
attribute vec2 a_textureCoord;
attribute vec3 aNormal;

varying vec2 TexCoords;

void main()
{
    TexCoords = a_textureCoord;
    gl_Position = vec4(a_vertexPosition, 1.0);
}