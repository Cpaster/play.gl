import PlayGL from '../../src/core';
import createSphere from '../../src/geometry/sphere';


import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';

const canvas = document.getElementById('page');

(async function() {
  const playGl = new PlayGL(canvas);

  playGl.clear();

  const program = playGl.createProgram(framentShader, vertexShader);

  playGl.use(program);

  const sphere = createSphere({
    xSegment: 64,
    ySegment: 64
  });

  // playGl.addMeshData({
  //   positions: [
  //     [-0.5, -0.5, 0.0],
  //     [0.5,  -0.5, 0.0],
  //     [0.0,  0.5,  0.0]
  //   ]
  // });
  playGl.addMeshData({
    positions: sphere.position,
    cells: sphere.cells,
    mod: playGl.glContext[sphere.mod]
  });

  playGl.render();

})();