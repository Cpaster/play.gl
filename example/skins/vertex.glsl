#version 300 es
in vec3 a_vertexPosition;
in vec4 boneNdx;
in vec4 weight;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 bones[4];

void main() {
  vec4 iPosition = vec4(a_vertexPosition, 1.0);
  gl_Position = projection * view *
    (
      bones[int(boneNdx[0])] * iPosition * weight[0] +
      bones[int(boneNdx[1])] * iPosition * weight[1] +
      bones[int(boneNdx[2])] * iPosition * weight[2] +
      bones[int(boneNdx[3])] * iPosition * weight[3]
    );
  // gl_Position = projection * view * iPosition;
}