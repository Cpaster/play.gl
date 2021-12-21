import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';

import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';
import framentSingleShader from './fragmentSingleShader.glsl';

const canvas = document.getElementById('page');

(async function() {
  const playGl = new PlayGL(canvas, {
    depth: true,
    stencil: true
  });

  const {gl} = playGl;

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.enable(gl.STENCIL_TEST);
  gl.stencilFunc(gl.NOTEQUAL, 1, 0xFF);
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);

  playGl.clear();

  const program = playGl.createProgram(framentShader, vertexShader);
  const program2 = playGl.createProgram(framentSingleShader, vertexShader);

  playGl.use(program);

  const {width, height} = canvas.getBoundingClientRect();

  const perspectiveMatix = [];
  const view = [];
  const model = [];

  mat4.perspective(perspectiveMatix, Math.PI / 6, width / height, 0.1, 100);
  mat4.rotate(model, mat4.create(), 0, [1, 0, 0]);

  mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
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

  gl.stencilMask(0x00);
  // plane
  playGl.addMeshData({
    positions: [
      [5.0, -0.5, 5.0], [-5.0, -0.5,  5.0], [-5.0, -0.5, -5.0],
      [5.0, -0.5, 5.0], [-5.0, -0.5, -5.0], [5.0, -0.5, -5.0]
    ],
    textureCoord: [
      [2, 0], [0, 0], [0, 2], [2, 0], [0, 2], [2, 2],
    ],
  });
  
  playGl.setUniform('texture1', planeTexture);
  playGl.draw();

  gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
  gl.stencilMask(0xFF);
  // box
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

  playGl.setUniform('texture1', wallTexture);
  playGl.draw();

  gl.stencilFunc(gl.NOTEQUAL, 1, 0xFF);
  gl.stencilMask(0x00);
  gl.disable(gl.DEPTH_TEST);
  // box
  playGl.use(program2);
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

  mat4.perspective(perspectiveMatix, Math.PI / 6, width / height, 0.1, 100);
  mat4.scale(model, mat4.create(), [1.1, 1.1, 1.1]);

  mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('view', view);
  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('model', model);
  playGl.draw();
  
  gl.stencilMask(0xFF);
  gl.stencilFunc(gl.ALWAYS, 0, 0xFF);
  gl.enable(gl.DEPTH_TEST);
})()