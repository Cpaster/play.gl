import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';
import * as vec3 from '../../src/math/vec3';

import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

const canvas: HTMLCanvasElement = document.getElementById('page') as HTMLCanvasElement;

function createTBN({
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
    bitTangent: vec3.normalize([], vec3.scale([], f,bitTangent)),
    tangent: vec3.normalize([], vec3.scale([], f, tangent))
  }
}

function createPlaneVertex() {
  // points
  const pos1 = [-1.0, 1.0, 0];
  const pos2 = [-1.0, -1.0, 0];
  const pos3 = [1.0, -1.0, 0];
  const pos4 = [1.0, 1.0, 0];

  // texture
  const uv1 = [0, 1.0];
  const uv2 = [0, 0];
  const uv3 = [1.0, 0.0];
  const uv4 = [1.0, 1.0];

  const normal = [0, 0, 1];
  
  let edge1 = vec3.subtract([], pos2, pos1);
  let edge2 = vec3.subtract([], pos3, pos1);

  let deltaUV1 = vec3.subtract([], uv2, uv1);
  let deltaUV2 = vec3.subtract([], uv3, uv1);

  const { bitTangent, tangent } = createTBN({
    edge1,
    edge2,
    deltaUV1,
    deltaUV2
  });

  edge1 = vec3.subtract([], pos3, pos1);
  edge2 = vec3.subtract([], pos4, pos1);

  deltaUV1 = vec3.subtract([], uv3, uv1);
  deltaUV2 = vec3.subtract([], uv4, uv1);
  
  const { bitTangent: bitTangent1, tangent: tangent1 } = createTBN({
    edge1,
    edge2,
    deltaUV1,
    deltaUV2
  });

  return {
    positions: [
      pos1,
      pos2,
      pos3,
      pos1,
      pos3,
      pos4
    ],
    attributes: {
      aNormal: {
        data: new Array(6).fill(normal)
      },
      textureCoord: {
        data: [
          uv1,
          uv2,
          uv3,
          uv1,
          uv3,
          uv4,
        ]
      },
      tangent: {
        data: [
          tangent,
          tangent,
          tangent,
          tangent1,
          tangent1,
          tangent1
        ]
      },
      bitangent: {
        data: [
          bitTangent,
          bitTangent,
          bitTangent,
          bitTangent1,
          bitTangent1,
          bitTangent1
        ]
      }
    }
  };
}

(async function() {
  const playGl = new PlayGL(canvas);
  const program = playGl.createProgram(fragment, vertex);
  playGl.use(program);

  // 创建投影相机信息
  const {width, height} = canvas.getBoundingClientRect();

  const perspectiveMatix = [];
  const view = [];
  const model = [];

  mat4.perspective(perspectiveMatix, Math.PI / 6, width / height, 0.1, 100);
  mat4.rotate(model, mat4.create(), 0, [1, 0, 0]);

  mat4.lookAt(view, [1, 1, 3], [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('view', view);
  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('model', model);

  // 创建纹理信息
  const wall = await playGl.loadTexture('./img/brickwall.jpg', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  });

  const wallNormal = await playGl.loadTexture('./img/brickwall_normal.jpg', {
    wrapT: 'REPEAT',
    wrapS: 'REPEAT'
  });

  playGl.setUniform('diffuseMap', wall);
  playGl.setUniform('normalMap', wallNormal);

  playGl.addMeshData({
    ...createPlaneVertex()
  });

  playGl.render();
})();