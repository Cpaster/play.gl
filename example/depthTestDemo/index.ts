import PlayGL from '../../src/core';
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
    textureCoord: [
      [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0],
      [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0],
      [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 0],
      [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 0],
      [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
      [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
    ],
  });

  const {width, height} = canvas.getBoundingClientRect();

  const perspectiveMatix = [];
  const view = [];
  const model = [];

  mat4.perspective(perspectiveMatix, Math.PI / 4, width / height, 0.1, 100);
  mat4.rotate(model, mat4.create(), 0, [1, 0, 0]);

  console.log(typeof mat4.create());

  mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('view', view);
  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('model', model);

  const wallTexture = await playGl.loadTexture('./example/depthTestDemo/img/marble.jpg')
  playGl.setUniform('wall', wallTexture);
  playGl.draw();

  playGl.addMeshData({
    positions: [
      [5.0, -0.5, 5.0], [-5.0, -0.5,  5.0], [-5.0, -0.5, -5.0],
      [5.0, -0.5, 5.0], [-5.0, -0.5, -5.0], [5.0, -0.5, -5.0]
    ],
    textureCoord: [
      [2, 0], [0, 0], [0, 2], [2, 0], [0, 2], [2, 2],
    ],
  });
  const planeTexture = await playGl.loadTexture('./example/depthTestDemo/img/metal.png', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  });
  playGl.setUniform('wall', planeTexture);
  playGl.draw();

  // playGl.addMeshData({
  //   positions: [[1, 1, 0], [1, 0, 0], [0, 0, 0], [0, 1, 0]],
  //   textureCoord: [[1, 1], [1, 0], [0, 0], [0, 1]],
  //   cells: [[0, 1, 2], [2, 3, 0]]
  // });
  // const boxTexture = await playGl.loadTexture('./example/depthTestDemo/img/box.jpg')
  // playGl.setUniform('wall', boxTexture);
  // playGl.draw();
  // playGl.render();
})()