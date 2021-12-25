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

  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('skybox', cubeTextures);

  playGl.use(program);
  playGl.setUniform('projection', perspectiveMatix);

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
    attributes: {
      aNormal: [
        [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1],
        [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],
        [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
        [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
        [0, -1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0],
        [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]
      ]
    },
    uniforms: {
      skybox: cubeTextures
    },
  });

  let time = 0;
  const radius = 2;
  const {gl} = playGl;
  function updateCamera() {
    time++;
    const view = [];
    playGl.clear();
    // const x = Math.sin(time / 100) * radius;
    const z = Math.cos(time / 100) * radius;
    // const y = Math.sin(time / 100) * radius;
    const cameraPos = [3, 0, 0];
    mat4.lookAt(view, cameraPos, [0, 0, 0], [0, 1, 0]);

    playGl.use(program);
    playGl.setUniform('view', view);
    const translate = mat4.translate([], mat4.create(), [0, z, 0]);
    playGl.setUniform('cameraPos', cameraPos);
    playGl.setUniform('model', translate);
    // console.log(mat4.transpose([], mat4.invert([], translate)));
    playGl.setUniform('normalModel', mat4.transpose([], mat4.invert([], translate)));
    playGl.draw();
    
    gl.depthFunc(gl.LEQUAL);
    playGl.use(program2);
    const a = mat4.fromMat4([], view);
    const b = mat4.toMat4([], a);
    playGl.setUniform('view', b);
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