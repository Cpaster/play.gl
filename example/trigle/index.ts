import PlayGL from '../../src/core';

import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';

const canvas = document.getElementById('page');

(async function() {
  const playGl = new PlayGL(canvas);

  playGl.clear();

  const program = playGl.createProgram(framentShader, vertexShader);

  playGl.use(program);

  playGl.addMeshData({
    positions: [
      [-0.5, -0.5, 0.0],
      [0.5,  -0.5, 0.0],
      [0.0,  0.5,  0.0]
    ]
  });

  playGl.render();

})();