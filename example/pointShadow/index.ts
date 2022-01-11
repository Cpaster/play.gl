import PlayGL from '../../src/core';

import { createCube } from '../common/geometry';
import * as mat4 from '../../src/math/mat4';
import * as vec3 from '../../src/math/vec3';

import shadowFragment from './shadow_fragment.glsl';
import shadowVertex from './shadow_vertex.glsl';

import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

const canvas: HTMLCanvasElement = document.getElementById('page') as HTMLCanvasElement;

const shadowWidth = 1000;
const shadowHeight = 1000;

function renderScene(playGl: PlayGL) {
  const cube1Model = mat4.translate([], mat4.create(), [0, 0, 0]);
  const cube1Geo = createCube(playGl, 1);
  cube1Geo.setMeshUniform('model', cube1Model);
  cube1Geo.setMeshUniform('reverseNormal', 1);
  cube1Geo.setMeshUniform('normalModel', mat4.transpose([], mat4.invert([], cube1Model)));
  cube1Geo.setMeshUniform('color', [1.0, 1.0, 0]);

  const cube2Model = mat4.translate([], mat4.create(), [-0.3, -0.3, 0]);
  const cube2Model2 = mat4.rotate([], cube2Model, Math.PI / 3, [0, 1, 0]);

  const cube2Geo = createCube(playGl, 0.2);
  cube2Geo.setMeshUniform('model', cube2Model2);
  cube2Geo.setMeshUniform('reverseNormal', 0);
  cube2Geo.setMeshUniform('normalModel', mat4.transpose([], mat4.invert([], cube2Model2)));
  cube2Geo.setMeshUniform('color', [1.0, 0, 1.0]);

  playGl.render();
}

function lightProjectionAndViews(playGl, lightPostion) {
  const lightPrejectViewMarix = [];
  const cameraConfs = [
    {
      up: [0, -1, 0],
      direction: [1, 0, 0]
    },
    {
      up: [0, -1, 0],
      direction: [-1, 0, 0]
    },
    {
      up: [0, 0, 1],
      direction: [0, 1, 0]
    },
    {
      up: [0, 0, -1],
      direction: [0, -1, 0]
    },
    {
      up: [0, -1, 0],
      direction: [0, 0, 1]
    },
    {
      up: [0, -1, 0],
      direction: [0, 0, -1]
    }
  ];
  const near = 1;
  const far = 20;
  const lightProjection = mat4.ortho([], -20, 20, -20, 20, near, far);
  // const lightProjection = mat4.perspective([], Math.PI / 2, shadowWidth / shadowHeight, near, far);
  cameraConfs.forEach(cameraConf => {
    const lightView = mat4.lookAt([], lightPostion, vec3.add([], lightPostion, cameraConf.direction), cameraConf.up);
    const lightSpaceMatrix = mat4.multiply([], lightProjection, lightView);
    lightPrejectViewMarix.push(lightSpaceMatrix);
  });

  return lightPrejectViewMarix;
  // playGl.setUniform('lightSpaceMatrix', lightSpaceMatrix);
}

(async function() {
  const {width, height} = canvas.getBoundingClientRect();
  const playGl = new PlayGL(canvas, {
    antialias: true
  });

  const texture = await playGl.loadTexture('./example/common/img/wall.jpg', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  });

  const gl = playGl.glContext;
  const shadowProgram = playGl.createProgram(shadowFragment, shadowVertex);
  const program = playGl.createProgram(fragment, vertex);
  // console.log(shadowProgram);
  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.CW);
  // gl.disable(gl.CULL_FACE);
  // const depthFBO = playGl.createFrameBuffer('depth', {
  //   width: shadowWidth,
  //   height: shadowHeight
  // });
  // console.log(depthFBO);

  // playGl.clear();
  // const near = 1;
  // const far = 20;
  // const lightProjection = mat4.ortho([], -20, 20, -20, 20, near, far);
  // const lightProjection = mat4.perspective([], Math.PI / 2, shadowWidth / shadowHeight, near, far);

  // const lightView = mat4.lookAt([], lightPostion, [0, 0, 0], [0, 1, 0]);
  // const lightSpaceMatrix = mat4.multiply([], lightProjection, lightView);
  // playGl.use(shadowProgram);
  // playGl.setUniform('lightSpaceMatrix', lightSpaceMatrix);
  
  // playGl.bindFBO(depthFBO);
  // gl.viewport(0, 0, shadowWidth, shadowHeight);
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // renderScene(playGl);
  // playGl.setDefaultFBO();
  // gl.viewport(0, 0, width, height);
  // gl.clearColor(0, 0, 0, 1);
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const cubeDepthFbo = playGl.createTextureCubeFrameBuffer({
    width: shadowWidth,
    height: shadowHeight
  });
  console.log(cubeDepthFbo);
  console.log(lightProjectionAndViews);
  playGl.use(shadowProgram);
  // playGl.use(shadowProgram);

  // const matrixs = lightProjectionAndViews(playGl, [0.9, 0.9, 0.9]);

  gl.viewport(0, 0, shadowWidth, shadowHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // cubeDepthFbo?.frameBuffers.forEach((fbo, index) => {
  //   playGl.bindFBO(fbo);
  //   playGl.setUniform('lightSpaceMatrix', matrixs[index]);
  //   renderScene(playGl);
  //   playGl.setDefaultFBO();
  // });

  // console.log(cubeDepthFbo.texture);
  
  playGl.use(program);
  const projection = mat4.perspective([], Math.PI / 2, width / height, 0.1, 100);
  // const projection = mat4.ortho([], -2, 2, -2, 2, 0.1, 7.5);
  playGl.setUniform('projection', projection);
  playGl.setUniform('diffuseTexture', texture);
  // playGl.setUniform('shadowMap', cubeDepthFbo.texture);
  playGl.setUniform('textureSize', [shadowWidth, shadowHeight]);
  // playGl.setUniform('lightSpaceMatrix', lightSpaceMatrix);

  let viewPosition = [1, 0, 0];
  const view = mat4.lookAt([], viewPosition, [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('view', view);
  playGl.setUniform('viewPos', viewPosition);

  let time = 0;
  const radius = 0.9;
  renderScene(playGl); 
  function updateCamera() {
    console.log(time);
    time = (time === 500 ? 0 : time + 1);
    const r = Math.PI * 2;
    const x = Math.sin(r * (time / 500)) * radius;
    const y = Math.cos(r * (time / 500)) * radius;
    let lightPostion = [x, y, 0];
    playGl.setUniform('lightPos', lightPostion);

    playGl.render();
  
    // requestAnimationFrame(updateCamera);
  }

  updateCamera();
})();