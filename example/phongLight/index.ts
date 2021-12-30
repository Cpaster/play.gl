import PlayGL from '../../src/core/index';
import * as mat4 from '../../src/math/mat4';

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
      [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5,-0.5], [-0.5, -0.5, -0.5],
      [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5,0.5], [-0.5, -0.5, 0.5],
      [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5,0.5], [-0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5],
      [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [-0.5, -0.5,0.5], [-0.5, -0.5, -0.5],
      [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]
    ],
    attributes: {
      aNormal: {
        data: [
          [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1],
          [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],
          [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
          [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
          [0, -1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0],
          [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]
        ]
      }
    }
  });

  const {width, height} = canvas.getBoundingClientRect();

  const perspectiveMatix = [];
  const view = [];

  mat4.perspective(perspectiveMatix, Math.PI / 4, width / height, 0.1, 100);

  let viewPosition = [0, 0, 3];
  mat4.lookAt(view, viewPosition, [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('view', view);
  playGl.setUniform('viewPosition', viewPosition);
  playGl.setUniform('projection', perspectiveMatix);

  // 灯光
  playGl.setUniform('objectColor', [1.0, 0.4, 1.0, 1.0]);
  // playGl.setUniform('lightColor', [1.0, 1.0, 1.0]);
  playGl.setUniform('lightPosition', [1.2, 1, 2]);
  playGl.setUniform('ambientStrength', 0.5);
  playGl.setUniform('shininess', 32.0);

  let time = 0;

  function updateCamera() {
    time++;
    const newModel = mat4.rotate([], mat4.create(), time / 100, [1, 1, 0]);
    const normalModel = mat4.transpose([], mat4.invert([], newModel));

    const [x, y, z] = [Math.sin(time * 0.007), Math.sin(time * 0.021), Math.sin(time * 0.03)];
    playGl.setUniform('lightColor', [x, y, z]);
    playGl.setUniform('model', newModel);
    playGl.setUniform('normalModel', normalModel);

    playGl.render();
    requestAnimationFrame(updateCamera);
  }

  updateCamera();
})();