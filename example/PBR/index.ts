import PlayGL from '../../src/core';
import createSphere from '../../src/geometry/sphere';
import { PerspectiveCamera } from '../../src/camera';

import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';

const canvas = document.getElementById('page');

(async function() {

  const playGl = new PlayGL(canvas);

  playGl.clear();

  const program = playGl.createProgram(framentShader, vertexShader);

  playGl.use(program);

  const camera = new PerspectiveCamera(Math.PI / 4, 0.5, 0.1, 1000);
  camera.lookAt({
    x: 0, y: 0, z: 0
  });
  camera.position({
    x: 0, 
    y: 2,
    z: 1
  });
  camera.updateCamera();

  playGl.setUniform('view', camera.viewMatrix);
  playGl.setUniform('projection', camera.projectionMatrix);

  const sphere = createSphere({
    xSegment: 64,
    ySegment: 64
  });

  playGl.addMeshData({
    positions: sphere.position,
    cells: sphere.cells,
    mod: playGl.glContext[sphere.mod],
    attributes: {
      aNormal: {
        data: sphere.aNormal
      }
    }
  });

  playGl.render();

})();