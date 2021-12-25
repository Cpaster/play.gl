import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';

import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';
import vertexSkyBoxShader from './vertexSkyShader.glsl';
import fragmentSkyBoxShader from './fragmentSkyShader.glsl';

const canvas = document.getElementById('page');

(async function() {

  const playGl = new PlayGL(canvas);

  playGl.clear();

  const program = playGl.createProgram(framentShader, vertexShader);
  const program2 = playGl.createProgram(fragmentSkyBoxShader, vertexSkyBoxShader);

  const { width, height } = canvas.getBoundingClientRect();

  const perspectiveMatix = [];

  mat4.perspective(perspectiveMatix, Math.PI / 3, width / height, 0.1, 100);

  // skyBox
  playGl.use(program2);
  playGl.addMeshData({
    positions: [
      [-1.0, 1.0, -1.0], [-1.0, -1.0, -1.0], [1.0, -1.0, -1.0], [1.0, -1.0, -1.0], [1.0, 1.0, -1.0], [-1.0, 1.0, -1.0],
      [-1.0, -1.0, 1.0], [-1.0, -1.0, -1.0], [-1.0, 1.0, -1.0], [-1.0, 1.0, -1.0], [-1.0, 1.0, 1.0], [-1.0, -1.0, 1.0],
      [1.0, -1.0, -1.0], [1.0, -1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, -1.0], [1.0, -1.0, -1.0],
      [-1.0, -1.0, 1.0], [-1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, -1.0, 1.0], [-1.0, -1.0, 1.0],
      [-1.0, 1.0, -1.0], [1.0, 1.0, -1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [-1.0, 1.0, 1.0], [-1.0, 1.0, -1.0],
      [-1.0, -1.0, -1.0], [-1.0, -1.0, 1.0], [1.0, -1.0, -1.0], [1.0, -1.0, -1.0], [-1.0, -1.0, 1.0], [1.0, -1.0, 1.0]
    ]
  });

  const cubeTextures = await playGl.loadTexture([
    './example/skybox/img/sky/right.png',
    './example/skybox/img/sky/left.png',
    './example/skybox/img/sky/top.png',
    './example/skybox/img/sky/bottom.png',
    './example/skybox/img/sky/front.png',
    './example/skybox/img/sky/back.png',
  ], {
    isFlipY: false
  });

  // playGl.setUniform('view', view);
  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('skybox', cubeTextures);
  // playGl.draw();

  playGl.use(program);
  const model = [];
  mat4.translate(model, mat4.create(), [5, 0, 0]);
  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('model', model);

  const wallTexture = await playGl.loadTexture('./example/skybox/img/wall.jpg', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  });

  // // box
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
    uniforms: {
      texture1: wallTexture
    },
  });
  // playGl.draw();

  let time = 0;
  const radius = 10;
  const {gl} = playGl;
  function updateCamera() {
    time++;
    const view = [];
    playGl.clear();
    const x = Math.sin(time / 100) * radius;
    const z = Math.cos(time / 100) * radius;
    const y = Math.sin(time / 100) * radius;
    mat4.lookAt(view, [0, 0, 0.5], [x, y, z], [0, 1, 0]);
    playGl.use(program);
    playGl.setUniform('view', view);
    mat4.translate(model, mat4.create(), [x, y, 0]);
    playGl.setUniform('model', model);
    playGl.draw();
    gl.depthFunc(gl.LEQUAL);
    playGl.use(program2);
    playGl.setUniform('view', view);
    playGl.draw();
    gl.depthFunc(gl.LESS);
    requestAnimationFrame(updateCamera);
  }
  updateCamera();

  // playGl.setUniform('skybox');
  // playGl.draw();

  // let time = 0;
  // const radius = 4;

  // function updateCamera() {
  //   time++;
  //   playGl.clear();
  //   const view = [];
  //   const x = Math.sin(time / 100) * radius;
  //   const z = Math.cos(time / 100) * radius;
  //   mat4.lookAt(view, [x, 0, z], [0, 0, 0], [0, 1, 0]);
  //   playGl.setUniform('view', view);
  //   playGl.draw();
  //   requestAnimationFrame(updateCamera);
  // }

  // updateCamera();
})()