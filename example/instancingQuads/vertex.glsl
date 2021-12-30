#version 300 es

in mat4 aInstanceMatrix;
in vec3 aColor;
in vec3 a_vertexPosition;

out vec3 fColor;

void main()
{
    fColor = aColor;
    // vec3 pos =  a_vertexPosition * (float(gl_InstanceID) / 100.0);
    // gl_Position = vec4(pos + vec3(aOffset, 0.0), 1.0);
    gl_Position = aInstanceMatrix * vec4(a_vertexPosition, 1.0);
}