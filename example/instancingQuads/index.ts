import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';

import vertexShader from './vertex.glsl';
import framentShader from './fragment.glsl';

const canvas = document.getElementById('page');

(async function() {

  const playGl = new PlayGL(canvas, {
    isWebGL2: true
  });

  // const gl = playGl.gl as WebGL2RenderingContext;

  const program = playGl.createProgram(framentShader, vertexShader);

  const translations = [];

  let index = 0;
  let offset = 0.1;
  for (let y = -10; y < 10; y += 2) {
    for (let x = -10; x < 10; x += 2) {
      const translation = [];
      translation[0] = x / 10 + offset;
      translation[1] = y / 10 + offset;
      translations[index++] = translation;
    }
  }

  const positions = [
    [-0.05, 0.05, 0], [0.05, -0.05, 0], [-0.05, -0.05, 0],
    [-0.05, 0.05, 0], [0.05, -0.05, 0], [0.05, 0.05, 0],
  ];

  playGl.use(program);

  const model = [];
  mat4.rotate(model, mat4.create(), Math.PI / 4, [1, 1, 0]);

  playGl.addMeshData({
    positions,
    instanceCount: 1,
    attributes: {
      aColor: {
        data: [
          [1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0],
          [1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 1.0, 1.0],
        ]
      },
      aInstanceMatrix: {
        data: [model],
        divisor: 1
      }
      // aOffset: {
      //   data: translations,
      //   divisor: 1
      // }
    }
  });

  playGl.render();
})();

