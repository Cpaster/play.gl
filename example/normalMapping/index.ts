import PlayGL from '../../src/core';
import { createTBN } from '../../src/helper';
import * as mat4 from '../../src/math/mat4';
import * as vec3 from '../../src/math/vec3';

import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

const canvas: HTMLCanvasElement = document.getElementById('page') as HTMLCanvasElement;

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

  const normal = [0, 0, 1.0];
  
  let edge1 = vec3.subtract([], pos2, pos1);
  let edge2 = vec3.subtract([], pos3, pos1);

  let deltaUV1 = vec3.subtract([], [...uv2, 0.0], [...uv1, 0.0]);
  let deltaUV2 = vec3.subtract([], [...uv3, 0.0], [...uv1, 0.0]);

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
    textureCoord: [
      uv1,
      uv2,
      uv3,
      uv1,
      uv3,
      uv4,
    ],
    attributes: {
      aNormal: {
        data: [
          normal,
          normal,
          normal,
          normal,
          normal,
          normal
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
  const playGl = new PlayGL(canvas, {
    isWebGL2: true,
    antialias: true
  });
  const program = playGl.createProgram(fragment, vertex);
  playGl.use(program);

  // 设置基础信息
  const viewPos = [0, 0, 5];

  // 创建投影相机信息
  const {width, height} = canvas.getBoundingClientRect();

  const perspectiveMatix = [];
  const view = [];
  const model = [];

  mat4.perspective(perspectiveMatix, Math.PI / 6, width / height, 0.1, 100);
  mat4.rotate(model, mat4.create(), 0, [1, 0, 0]);

  mat4.lookAt(view, viewPos, [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('view', view);
  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('model', model);

  // 创建纹理信息
  const wall = await playGl.loadTexture('./example/normalMapping/img/brickwall.jpg', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  });

  const wallNormal = await playGl.loadTexture('./example/normalMapping/img/brickwall_normal.jpg', {
    wrapT: 'REPEAT',
    wrapS: 'REPEAT'
  });

  playGl.setUniform('diffuseMap', wall);
  playGl.setUniform('normalMap', wallNormal);

  // 设置环境光照
  playGl.addMeshData({
    ...createPlaneVertex()
  });

  let time = 0;
  const radius = 1;
  function updateCamera() {
    playGl.clear();
    time++;
    const x = Math.sin(time / 50) * radius;
    const y = Math.cos(time / 50) * radius;
    const lightPos = [x, y, 1];
    playGl.setUniform('lightPos', lightPos);
    playGl.render();
    requestAnimationFrame(updateCamera);
  }

  updateCamera();
})();