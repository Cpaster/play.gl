import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';
import createSphere from '../../src/geometry/sphere';
import { PerspectiveCamera } from '../../src/camera';
import LightCluster from '../common/lights';

import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';

const canvas = document.getElementById('page');

(async function() {

  const {width, height} = canvas.getBoundingClientRect();

  const playGl = new PlayGL(canvas, {
    antialias: true,
    isWebGL2: true,
    depth: true,
  });

  const program = playGl.createProgram(framentShader, vertexShader);

  playGl.use(program);

  const lightCluster = new LightCluster(playGl, false);

  lightCluster.addPointLight({
    position: [-4, -4, 4],
    ambient: [0.1, 0.1, 0.1],
    diffuse: [1.0, 1.0, 1.0],
    specular: [1.0, 1.0, 1.0],
    constant: 1.0,
    linear: 0.045,
    quadratic: 0.0075
  });

  lightCluster.addDirectionLight({
    direction: [4, 4, 4],
    ambient: [0.1, 0.1, 0.1],
    diffuse: [0.8, 0.8, 0.8],
    specular: [1.0, 1.0, 1.0]
  });

  lightCluster.add();

  const camera = new PerspectiveCamera(Math.PI / 3, width / height, 0.1, 1000);

  playGl.setUniform('projection', camera.projectionMatrix);

  playGl.setUniform('materialColor', [1.0, 0.0, 0.0]);

  const nrRows = 7;
  const nrCols = 7;
  const space = 2.5;

  function clamp(v: number, min: number, max: number) {
    if (v > max) {
      return max;
    }
    if (v < min) {
      return min;
    }
    else {
      return v;
    }
  };

  const models = [];

  for (let row = 0; row < nrRows; ++row) {
    playGl.setUniform('metallic', row / nrRows);
    for (let col = 0; col < nrCols; ++col) {
      playGl.setUniform('roughness', clamp(col / nrCols, 0.05, 1.0));

      const model = [];
      mat4.translate(
        model,
        mat4.create(),
        [(col - (nrCols / 2)) * space, (row - (nrRows / 2)) * space, 0.0]
      );
      models.push(model);
    }
  }

  const sphere = createSphere({
    xSegment: 64,
    ySegment: 64
  });

  playGl.addMeshData({
    instanceCount: models?.length,
    mod: playGl.glContext[sphere.mod],
    positions: sphere.position,
    textureCoord: sphere.textureCoord,
    cells: sphere.cells,
    attributes: {
      aNormal: {
        data: sphere.aNormal
      },
      aInstanceMatrix: {
        data: models,
        divisor: 1
      }
    },
  });

  let time = 0;

  function update() {
    time++;
    playGl.clear();
    camera.position({
      x: 25 * Math.sin(time * 0.01),
      y: 0,
      z: 25 * Math.cos(time * 0.01),
    });

    camera.updateCamera();

    playGl.setUniform('view', camera.viewMatrix);
    playGl.setUniform('viewPosition', camera.cameraPosition);

    playGl.render();
    requestAnimationFrame(update);
  }

  update();

})();