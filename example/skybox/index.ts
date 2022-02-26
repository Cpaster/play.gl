import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';

import createSphere from '../../src/geometry/sphere';

import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';
import vertexSkyBoxShader from './vertexSkyShader.glsl';
import fragmentSkyBoxShader from './fragmentSkyShader.glsl';

const canvas = document.getElementById('page');

(async function() {

  const playGl = new PlayGL(canvas, {
    isWebGL2: true,
    antialias: true
  });

  playGl.clear();

  const program = playGl.createProgram(framentShader, vertexShader);
  const program2 = playGl.createProgram(fragmentSkyBoxShader, vertexSkyBoxShader);

  const { width, height } = canvas.getBoundingClientRect();

  playGl.createBlockUniform();

  // playGl.setGlobalUniform();

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
  // playGl.draw();

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

  // playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('skybox', cubeTextures);

  playGl.use(program);
  // playGl.setUniform('projection', perspectiveMatix);

  const models = [];
  const normalModels = [];
  for (let y = -20; y < 20; y += 2) {
    for (let x = -20; x < 20; x += 2) {
      const model1 = mat4.rotate([], mat4.create(), x / 20, [3, 7, 0]);
      const model = mat4.translate([], model1, [x, y, 0]);
      const normalModel = mat4.transpose([], mat4.invert(mat4.create(), model));
      models.push(model);
      normalModels.push(normalModel);
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
      },
      aInstanceNormalMatrix: {
        data: normalModels,
        divisor: 1
      }
    },
    uniforms: {
      skybox: cubeTextures
    },
  });
  
  playGl.setUniform('projection', perspectiveMatix);
  let time = 0;
  const radius = 20;
  const {gl} = playGl;
  playGl.setBlockUniformValue('Matrices', {
    projection: perspectiveMatix
  });
  function updateCamera() {
    time++;
    const view = [];
    playGl.clear();
    const x = Math.sin(time / 400) * radius;
    const z = Math.cos(time / 400) * radius;
    // const y = Math.sin(time / 100) * radius;
    const cameraPos = [x, 0, z];
    mat4.lookAt(view, cameraPos, [0, 0, 0], [0, 1, 0]);
    playGl.use(program);
    playGl.setUniform('view', view);
    const translate = mat4.translate([], mat4.create(), [0, 0, 0]);
    playGl.setUniform('cameraPos', cameraPos);
    playGl.setUniform('model', translate);

    playGl.setUniform('normalModel', mat4.invert([], translate));
    playGl.draw();
    
    gl.depthFunc(gl.LEQUAL);
    playGl.use(program2);
    const a = mat4.fromMat4ToMat3([], view);
    const b = mat4.toMat4([], a);
    playGl.setUniform('view', b);
    playGl.draw();
    gl.depthFunc(gl.LESS);
    requestAnimationFrame(updateCamera);
  }
  updateCamera();
})()