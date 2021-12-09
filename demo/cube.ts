import PlayGL from '../src/core';
import * as mat4 from '../src/math/mat4';

const canvas = document.getElementById('page');

(async function() {
  const playGl = new PlayGL(canvas);

  playGl.clear();

  const program = playGl.createProgram();

  playGl.use(program);

  playGl.addMeshData({
    positions: [
      [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5,-0.5], [-0.5, -0.5, -0.5],
      [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5,0.5], [-0.5, -0.5, 0.5],
      [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5,0.5], [-0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5],
      [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [-0.5, -0.5,0.5], [-0.5, -0.5, -0.5],
      [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]
    ],
    textureCoord: [
      [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0],
      [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0],
      [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 1],
      [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 1],
      [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
      [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
    ],
  })

  const {width, height} = canvas.getBoundingClientRect();

  const perspectiveMatix = [];
  const view = [];
  const model = [];

  mat4.perspective(perspectiveMatix, Math.PI / 4, width / height, 0.1, 100);
  // mat4.translate(view, mat4.create(), [0, 0, -3]);
  mat4.rotate(model, mat4.create(), Math.PI / 4, [1, 1, 0]);

  const wallTexture = await playGl.loadTexture('./demo/img/wall.jpg')
  playGl.setUniform('wall', wallTexture);

  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('model', model);

  let time = 0;
  const radius = 4;

  function updateCamera() {
    time++;
    const x = Math.sin(time / 100) * radius;
    const z = Math.cos(time / 100) * radius;
    mat4.lookAt(view, [x, 0, z], [0, 0, 0], [0, 1, 0]);
    playGl.setUniform('view', view);
    playGl.render();
    requestAnimationFrame(updateCamera);
  }

  updateCamera();

  // playGl.render();
  
  // playGl.setUniform('view', view);

})();