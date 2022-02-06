import * as vec3 from '../math/vec3';

export function createTBN({
  edge1,
  edge2,
  deltaUV1,
  deltaUV2
}) {
  const f = 1 / (edge1[0] * edge2[1] - edge1[1] * edge2[0]);

  const tangent = [
    deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0],
    deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1],
    deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2],
  ];

  const bitTangent = [
    deltaUV1[0] * edge2[0] - deltaUV2[0] * edge1[0],
    deltaUV1[0] * edge2[1] - deltaUV2[0] * edge1[1],
    deltaUV1[0] * edge2[2] - deltaUV2[0] * edge1[2],
  ];

  return {
    bitTangent: vec3.normalize([], vec3.scale([], bitTangent, f)),
    tangent: vec3.normalize([], vec3.scale([], tangent, f))
  }
}