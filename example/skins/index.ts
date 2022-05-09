import PlayGL from '../../src/core';


import { OrthoCamera } from '../../src/camera';
import { identity, translate, rotateZ, invert, multiply } from '../../src/math/mat4';

import vertex from './vertex.glsl';
import fragment from './fragment.glsl';

const canvas = document.getElementById('page');

function computeBoneMatrices(bones, angle) {
  const m = identity([]);
  rotateZ(bones[0], m, angle);
  translate(m, bones[0], [4, 0, 0]);
  rotateZ(bones[1], m, angle);
  translate(m, bones[1], [4, 0, 0]);
  rotateZ(bones[2], m, angle);
  return bones;
}

function createRGBATexture(mat4s) {
  let d = [];
  mat4s.forEach(mat4 => {
    d = d.concat(mat4);
  })
  return {
    pixels: new Float32Array(d),
    width: 4,
    height: 4
  };
}

(async () => {
  const playGl = new PlayGL(canvas, {
    isWebGL2: true
  });
  const program = playGl.createProgram(fragment, vertex);
  playGl.use(program);
  // 添加相机
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new OrthoCamera(-10 * aspect, 10 * aspect, -10, 10, -100, 100);
  camera.position({
    x: 0,
    y: 0,
    z: 6
  });
  camera.updateCamera();
  playGl.clear();

  playGl.addMeshData({
    positions: [
      [0, 1, 0], [0, -1, 0], [2, 1, 0], [2, -1, 0], [4, 1, 0],
      [4, -1, 0], [6, 1, 0], [6, -1, 0], [8, 1, 0], [8, -1, 0]
    ],
    cells: [
      [0, 1], [0, 2], [1, 3], [2, 3], [2, 4],
      [3, 5], [4, 5], [4, 6], [5, 7], [6, 7],
      [6, 8], [7, 9], [8, 9]
    ],
    attributes: {
      weight: {
        data: [
          [1,  0,  0,  0], [1,  0,  0,  0], [.5, .5,  0,  0], [.5, .5,  0,  0], [1,  0,  0,  0],
          [1,  0,  0,  0], [.5, .5,  0,  0], [.5, .5,  0,  0], [1,  0,  0,  0], [1,  0,  0,  0]
        ]
      },
      boneNdx: {
        data: [
          [0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], [ 0.0, 1.0, 0.0, 0.0], [ 0.0, 1.0, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0],
          [1.0, 0.0, 0.0, 0.0], [1.0, 2.0, 0.0, 0.0], [1.0, 2.0, 0.0, 0.0], [2.0, 0.0, 0.0, 0.0], [2.0, 0.0, 0.0, 0.0]
        ]
      }
    },
    mod: playGl.glContext.LINES
  });
  const bones = [];
  const bonePoses = [];
  const boneMatrices = [];
  for (let i = 0; i < 4; i++) {
    bonePoses.push(identity([]));
    bones.push(identity([]));
    boneMatrices.push(identity([]));
  }
  computeBoneMatrices(bonePoses, 0);
  const poseInverts = bonePoses.map(pose => {
    return invert([], pose);
  });

  playGl.setUniform('projection', camera.projectionMatrix);
  playGl.setUniform('view', camera.viewMatrix);

  playGl.setUniform('projection', camera.projectionMatrix);
  playGl.setUniform('view', camera.viewMatrix);
  playGl.setUniform('color', [1.0, 0.0, 0.0, 1.0]);

  function render(time = 0) {
    const t = time * 0.001;
    const angle = Math.sin(t) + 0.8;
    computeBoneMatrices(bones, angle);
    bones.forEach((bone, index) => {
      multiply(boneMatrices[index], bone, poseInverts[index]);
    });
    const textureData = createRGBATexture(boneMatrices);

    const texture = playGl.createTexture(playGl.glContext.TEXTURE_2D, [textureData], {
      wrapS: 'MIRRORED_REPEAT',
      wrapT: 'MIRRORED_REPEAT',
      minFilter: 'NEAREST',
      magFilter: 'NEAREST',
      format: 'RGBA',
      type: 'FLOAT'
    });
    playGl.setUniform('boneMatrixTexture', texture);
    playGl.render();
    requestAnimationFrame(render);
  }
  render();
})();

