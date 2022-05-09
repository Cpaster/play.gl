#version 300 es
in vec3 a_vertexPosition;
in vec4 boneNdx;
in vec4 weight;

uniform mat4 projection;
uniform mat4 view;
uniform sampler2D boneMatrixTexture;

mat4 getBoneMatrix(int boneNdx) {
  return mat4(
    texelFetch(boneMatrixTexture, ivec2(0, boneNdx), 0),
    texelFetch(boneMatrixTexture, ivec2(1, boneNdx), 0),
    texelFetch(boneMatrixTexture, ivec2(2, boneNdx), 0),
    texelFetch(boneMatrixTexture, ivec2(3, boneNdx), 0));
}

void main() {
  vec4 iPosition = vec4(a_vertexPosition, 1.0);
  gl_Position = projection * view *
    (
      getBoneMatrix(int(boneNdx[0])) * iPosition * weight[0] +
      getBoneMatrix(int(boneNdx[1])) * iPosition * weight[1] +
      getBoneMatrix(int(boneNdx[2])) * iPosition * weight[2] +
      getBoneMatrix(int(boneNdx[3])) * iPosition * weight[3]
    );
}