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
  const lightPos: Array<[number, number, number]> = [
    [-10, 10, 10],
    [10, 10, 10],
    [-10, -10, 10],
    [10, -10, 10]
  ];
  lightPos.forEach(pos => {
    lightCluster.addPointLight({
      position: pos,
      ambient: [0.1, 0.1, 0.1],
      diffuse: [1.0, 1.0, 1.0],
      specular: [1.0, 1.0, 1.0],
      constant: 1.0,
      linear: 0.045,
      quadratic: 0.0075
    });
  })

  lightCluster.add();

  // loader 纹理图片
  const albedo = await playGl.loadTexture('./example/PBRWithTexture/img/rustediron2_basecolor.png');
  const normal = await playGl.loadTexture('./example/PBRWithTexture/img/rustediron2_normal.png');
  const metallic = await playGl.loadTexture('./example/PBRWithTexture/img/rustediron2_metallic.png');
  const roughness = await playGl.loadTexture('./example/PBRWithTexture/img/rustediron2_roughness.png');

  playGl.setUniform('albedoMap', albedo);
  playGl.setUniform('normalMap', normal);
  playGl.setUniform('metallicMap', metallic);
  playGl.setUniform('roughnessMap', roughness);
  playGl.setUniform('ao', 1.0);

  const camera = new PerspectiveCamera(Math.PI / 2.7, width / height, 0.1, 1000);

  playGl.setUniform('projection', camera.projectionMatrix);

  playGl.setUniform('materialColor', [300.0, 300.0, 300.0]);

  const nrRows = 1;
  const nrCols = 1;
  const space = 2.5;

  const models = [];

  for (let row = 0; row < nrRows; ++row) {
    for (let col = 0; col < nrCols; ++col) {

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
      models: {
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
      x: 5 * Math.sin(time * 0.01),
      y: 0,
      z: 5 * Math.cos(time * 0.01),
    });

    camera.updateCamera();

    playGl.setUniform('view', camera.viewMatrix);
    playGl.setUniform('viewPosition', camera.cameraPosition);

    playGl.render();
    requestAnimationFrame(update);
  }

  update();

})();