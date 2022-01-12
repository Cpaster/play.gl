import PlayGL from '../../src/core';

import { createCube } from '../common/geometry';
import * as mat4 from '../../src/math/mat4';
import * as vec3 from '../../src/math/vec3';

import shadowFragment from './shadow_fragment.glsl';
import shadowVertex from './shadow_vertex.glsl';

import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

import debugFragment from './debug_fragment.glsl';
import debugvVertex from './debug_vertex.glsl';

const canvas: HTMLCanvasElement = document.getElementById('page') as HTMLCanvasElement;

const shadowWidth = 1024;
const shadowHeight = 1025;

const near = 0.1;
const far = 6;

// function renderDebugScene(playGl: PlayGL) {
//   const cube1Model = mat4.translate([], mat4.create(), [0, 0, 0]);
//   const cube1Geo = createCube(playGl, 1);
//   cube1Geo.setMeshUniform('model', cube1Model);

//   playGl.render();
// }

const sampleDist = [
  [1, 1,  1], [ 1, -1,  1], [-1, -1,  1], [-1, 1,  1],
  [1, 1, -1], [ 1, -1, -1], [-1, -1, -1], [-1, 1, -1],
  [1, 1,  0], [ 1, -1,  0], [-1, -1,  0], [-1, 1,  0],
  [1, 0,  1], [-1,  0,  1], [ 1,  0, -1], [-1, 0, -1],
  [0, 1,  1], [ 0, -1,  1], [ 0, -1, -1], [ 0, 1, -1]
]

const positions = [
  [1, 1, 1], [1, 1, -1], [1, -1, -1], [1, -1, -1], [1, -1, 1], [1, 1, 1],
  [-1, 1, 1], [-1, 1, -1], [-1, -1, -1], [-1, -1, -1], [-1, -1,1], [-1, 1, 1],
  [-1, 1, -1], [1, 1, -1], [1, 1, 1], [1, 1, 1], [-1, 1, 1], [-1, 1, -1],
  [-1, -1, -1], [1, -1, -1], [1, -1, 1], [1, -1, 1], [-1, -1,1], [-1, -1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [1, 1, 1], [-1, 1,1], [-1, -1, 1],
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [1, 1, -1], [-1, 1,-1], [-1, -1, -1],
]

function renderPScene(playGl: PlayGL, index) {
  console.log(index);
  const cube1Model = mat4.translate([], mat4.create(), [0, 0, 0]);
  // const cube1Geo = createCube(playGl, 1);
  const planeGeo = playGl.addMeshData({
    positions: [
      positions[index]
    ]
  });
  planeGeo.setMeshUniform('model', cube1Model);

  const cube2Model = mat4.translate([], mat4.create(), [-0.3, -0.3, 0]);
  const cube2Model2 = mat4.rotate([], cube2Model, Math.PI / 3, [0, 1, 0]);

  const cube2Geo = createCube(playGl, 0.2);
  cube2Geo.setMeshUniform('model', cube2Model2);
  // cube2Geo.setMeshUniform('reverseNormal', 0);
  // cube2Geo.setMeshUniform('normalModel', mat4.transpose([], mat4.invert([], cube2Model2)));

  playGl.render();
}

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
  const lightProjection = mat4.ortho([], -1, 1, -1, 1, near, far);
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

  // const texture = await playGl.loadTexture('./example/common/img/wall.jpg', {
  //   wrapS: 'REPEAT',
  //   wrapT: 'REPEAT'
  // });

  const gl = playGl.glContext;
  const shadowProgram = playGl.createProgram(shadowFragment, shadowVertex);
  const program = playGl.createProgram(fragment, vertex);
  console.log(program);

  const debugProgram = playGl.createProgram(debugFragment, debugvVertex);
  console.log(debugProgram);

  const cubeDepthFbo = playGl.createTextureCubeFrameBuffer({
    width: shadowWidth,
    height: shadowHeight
  });
  
  playGl.use(shadowProgram);

  const lightPos = [0, 0, 0];
  
  const matrixs = lightProjectionAndViews(playGl, lightPos);

  gl.viewport(0, 0, shadowWidth, shadowHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  playGl.bindFBO(cubeDepthFbo);
  playGl.setUniform('far_plane', far);
  playGl.setUniform('lightPos', lightPos);
  matrixs.forEach((matrix, index) => {
    playGl.setUniform('lightSpaceMatrix', matrix);
    console.log(index);
    renderPScene(playGl, index);
  });
  playGl.setDefaultFBO();

  // gl.viewport(0, 0, 1000, 1000);
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // playGl.use(debugProgram);
  // playGl.setUniform('lightPos', lightPos);
  // const projection = mat4.perspective([], Math.PI / 2, width / height, 0.1, 100);
  // playGl.setUniform('projection', projection);
  // playGl.setUniform('depthMap', cubeDepthFbo.texture);
  // playGl.setUniform('projectionMatrix', matrixs);
  // matrixs.forEach((matrix, index) => {
  //   playGl.setUniform(`projectionMatrix[${index}]`, matrix);
  // });
  // renderDebugScene(playGl);
  
  playGl.use(program);
  const projection = mat4.perspective([], Math.PI / 2, width / height, 0.1, 100);
  // const projection = mat4.ortho([], -2, 2, -2, 2, 0.1, 7.5);
  playGl.setUniform('projection', projection);
  // playGl.setUniform('diffuseTexture', texture);
  // playGl.setUniform('shadowMap', cubeDepthFbo.texture);
  playGl.setUniform('shadowMap', cubeDepthFbo.texture);
  playGl.setUniform('textureSize', [shadowWidth, shadowHeight]);
  // playGl.setUniform('lightSpaceMatrix', lightSpaceMatrix);
  let viewPosition = [1, 0, 0];
  const view = mat4.lookAt([], viewPosition, [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('view', view);
  playGl.setUniform('viewPos', viewPosition);
  matrixs.forEach((matrix, index) => {
    playGl.setUniform(`projectionMatrix[${index}]`, matrix);
  });
  playGl.setUniform('far_plane', far);
  sampleDist.forEach((sample, index) => {
    playGl.setUniform(`samply_arr[${index}]`, sample);
  })
  playGl.setUniform('lightPos', lightPos);
  renderScene(playGl);
  // let time = 0;
  // const radius = 3;
  // function updateCamera() {
    // time = (time === 500 ? 0 : time + 1);
    // const r = Math.PI * 2;
    // const x = Math.sin(r * (time / 900)) * radius;
    // const y = Math.cos(r * (time / 900)) * radius;
    // let lightPostion = [0.5, 0.5, 0];
    // let viewPosition = [1, 0, 0];
    // const view = mat4.lookAt([], viewPosition, [0, 0, 0], [0, 1, 0]);
    // playGl.setUniform('view', view);

    // playGl.render();
  
    // requestAnimationFrame(updateCamera);
  // }

  // updateCamera();
})();