import PlayGL from '../../src/core';
import createQuadratic from '../../src/geometry/quadratic';

import * as mat4 from '../../src/math/mat4';

import createSphere from '../../src/geometry/sphere';

import { PerspectiveCamera } from '../../src/camera';

import vertex from './vertex.glsl';
import fragment from './fragment.glsl';

// import fragmentPlane from './fragmentPlane.glsl';

const canvas = document.getElementById('page');

function createFontPlane(text, width, height) {
  const textCtx = document.createElement('canvas').getContext('2d');
  textCtx.clearRect(0, 0, width, height);
  textCtx.canvas.width = width;
  textCtx.canvas.height = height;
  textCtx.font = '25px monospace';
  textCtx.textAlign = 'center';
  textCtx.textBaseline = 'middle';
  textCtx.fillStyle = 'green';
  textCtx.fillText(text, width / 2, height / 2);
  return textCtx.canvas;
}

function addQuad(playGl) {
  const quad = createQuadratic({
    width: 1,
    height: 0.5
  });
  playGl.addMeshData({
    mod: playGl.glContext[quad.mod],
    positions: quad.position,
    textureCoord: quad.textureCoord,
    cells: quad.cells,
    useBlend: true
  });
}

function addSphere(playGl) {
  const sphere = createSphere({
    xSegment: 64,
    ySegment: 64
  });

  playGl.addMeshData({
    mod: playGl.glContext[sphere.mod],
    positions: sphere.position,
    textureCoord: sphere.textureCoord,
    cells: sphere.cells,
    // useBlend: true
  });
}

(async function() {
  const playGl = new PlayGL(canvas);

  const {width, height} = canvas.getBoundingClientRect();

  const textCanvas = createFontPlane('王孟东', 100, 50);
  playGl.clear();

  const program = playGl.createProgram(fragment, vertex);
  const planeProgram = playGl.createProgram(fragment, vertex);

  const camera = new PerspectiveCamera(Math.PI / 3, width / height, 0.1, 50);

  camera.position({
    x: 0,
    y: 0,
    z: 10,
  });
  camera.updateCamera();

  const text = await playGl.loadTexture(textCanvas);
  const img = await playGl.loadTexture('./example/common/img/wall.jpg');

  playGl.use(program);

  addSphere(playGl);

  const model = [];
  mat4.translate(
    model,
    mat4.create(),
    [0, 0, 0]
  );

  playGl.setUniform('projection', camera.projectionMatrix);

  playGl.setUniform('view', camera.viewMatrix);

  playGl.setUniform('model', model);

  playGl.setUniform('texture', img);

  playGl.draw();

  playGl.use(planeProgram);

  addQuad(playGl);

  playGl.setUniform('projection', camera.projectionMatrix);

  playGl.setUniform('view', camera.viewMatrix);

  mat4.translate(
    model,
    mat4.create(),
    [0, 0, 1]
  );

  playGl.setUniform('model', model);

  playGl.setUniform('texture', text);

  let time = 0;

  function update() {
    time++;

    playGl.clear();

    camera.position({
      x: 10 * Math.sin(time * 0.05),
      y: 0,
      z: 10 * Math.cos(time * 0.05),
    });
    camera.updateCamera();

    playGl.use(program);
    playGl.setUniform('view', camera.viewMatrix);
    playGl.draw();

    playGl.use(planeProgram);
    playGl.setUniform('view', camera.viewMatrix);
    playGl.draw();

    requestAnimationFrame(update);
  }

  update();

})()