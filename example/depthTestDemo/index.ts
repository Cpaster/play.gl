import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';

import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';
import framentFrameShader from './fragmentFrameShader.glsl';
import vertexFrameShader from './vertexFrameShader.glsl';

const canvas = document.getElementById('page');

(async function() {
  const playGl = new PlayGL(canvas);

  playGl.clear();

  const program = playGl.createProgram(framentShader, vertexShader);
  const program2 = playGl.createProgram(framentFrameShader, vertexFrameShader);

  playGl.use(program);

  const {width, height} = canvas.getBoundingClientRect();

  const perspectiveMatix = [];
  const view = [];
  const model = [];

  mat4.perspective(perspectiveMatix, Math.PI / 6, width / height, 0.1, 100);
  mat4.rotate(model, mat4.create(), 0, [1, 0, 0]);

  mat4.lookAt(view, [1, 1, 3], [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('view', view);
  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('model', model);

  const planeTexture = await playGl.loadTexture('./example/depthTestDemo/img/metal.png', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  });
  const wallTexture = await playGl.loadTexture('./example/depthTestDemo/img/wall.jpg', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  })

  // plane
  playGl.addMeshData({
    positions: [
      [5.0, -0.5, 5.0], [-5.0, -0.5,  5.0], [-5.0, -0.5, -5.0],
      [5.0, -0.5, 5.0], [-5.0, -0.5, -5.0], [5.0, -0.5, -5.0]
    ],
    textureCoord: [
      [2, 0], [0, 0], [0, 2], [2, 0], [0, 2], [2, 2],
    ],
    uniforms: {
      texture1: planeTexture
    }
  });

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
    }
  });
  const fbo = playGl.createFrameBuffer();
  console.log(fbo);
  console.log(program2);
  playGl.bindFBO(fbo);
  playGl.render();
  playGl.setDefaultFBO();

  playGl.use(program2);

  playGl.addMeshData({
    positions: [[0.5, 0.5, 0], [0.5, -0.5, 0], [-0.5, -0.5, 0], [-0.5, 0.5, 0]],
    textureCoord: [[1, 1], [1, 0], [0, 0], [0, 1]],
    cells: [[0, 1, 2], [2, 3, 0]],
    uniforms: {
      screenTexture: fbo.texture
    }
    // attributes: {
    //   color: [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]]
    // }
  })
  playGl.draw();

  // playGl.setDefaultFBO();
  // playGl.render();
  // console.log(fbo.toString());

  // let time = 0;
  // const radius = 4;

  // function updateCamera() {
  //   time++;
  //   playGl.render();
  //   const x = Math.sin(time / 100) * radius;
  //   const z = Math.cos(time / 100) * radius;
  //   mat4.lookAt(view, [x, 0, z], [0, 0, 0], [0, 1, 0]);
  //   playGl.setUniform('view', view);
  //   // requestAnimationFrame(updateCamera);
  // }

  // updateCamera();
})()