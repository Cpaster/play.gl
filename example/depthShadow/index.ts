import PlayGL from '../../src/core';
// import {arrayToBuffer} from '../../src/core/utils/helper';
import { createCube, createPlane } from '../common/geometry';
// import LightCluster from '../common/lights';
import * as mat4 from '../../src/math/mat4';

import shadowFragment from './shadow_fragment.glsl';
import shadowVertex from './shadow_vertex.glsl';

import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

import debugFragment from './debug_fragment.glsl';
import debugVertex from './debug_vertex.glsl';

const canvas: HTMLCanvasElement = document.getElementById('page') as HTMLCanvasElement;

// let lightPostion = [2, 7, 10];

// let viewPosition = [1, 2, 3];
// const viewPosition = lightPostion;

const shadowWidth = 1000;
const shadowHeight = 1000;

// function renderQuad(playGl: PlayGL) {
//   const planeGeo = playGl.addMeshData({
//     positions: [
//       [-1, 1, 0], [-1, -1, 0], [1, 1, 0], [1, -1, 0]
//     ],
//     textureCoord: [
//       [0, 1], [0, 0], [1, 1], [1, 0]
//     ],
//     // attributes: {
//     //   aNormal: {
//     //     data: [
//     //       [0, 1.0, 0], [0, 1.0, 0], [0, 1.0, 0],
//     //       [0, 1.0, 0], [0, 1.0, 0], [0, 1.0, 0]
//     //     ]
//     //   }
//     // }
//   });
//   return planeGeo;
// }

async function renderScene(playGl: PlayGL) {

  const texture = await playGl.loadTexture('./example/common/img/wall.jpg', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  });

  const texture2 = await playGl.loadTexture('./example/common/img/wall.jpg', {
    wrapS: 'CLAMP_TO_EDGE',
    wrapT: 'CLAMP_TO_EDGE',
    minFilter: 'NEAREST',
    magFilter: 'NEAREST',
  });

  const planeGeo = createPlane(playGl, 5.0);
  planeGeo.setMeshUniform('diffuseTexture', texture2);
  planeGeo.setMeshUniform('model', mat4.create());
  planeGeo.setMeshUniform('normalModel', mat4.create());

  const cube1Model = mat4.translate([], mat4.create(), [0, 0.5, 0]);
  const cube1Geo = createCube(playGl, 1);
  cube1Geo.setMeshUniform('diffuseTexture', texture);
  cube1Geo.setMeshUniform('model', cube1Model);
  cube1Geo.setMeshUniform('normalModel', mat4.transpose([], mat4.invert([], cube1Model)));

  const cube2Model = mat4.scale(
    [],
    mat4.translate([], mat4.create(), [2, 0, 1]),
    [0.5, 0.5, 0.5]
  );
  
  const cube2Geo = createCube(playGl, 1);
  cube2Geo.setMeshUniform('model', cube2Model);
  cube2Geo.setMeshUniform('diffuseTexture', texture);
  cube2Geo.setMeshUniform('normalModel', mat4.transpose([], mat4.invert([], cube2Model)));

  playGl.render();
}

(async function() {
  const {width, height} = canvas.getBoundingClientRect();
  const playGl = new PlayGL(canvas);

  // const texture = await playGl.loadTexture('./example/common/img/wall.jpg', {
  //   wrapS: 'REPEAT',
  //   wrapT: 'REPEAT'
  // });
//https://t7.baidu.com/it/u=1595072465,3644073269&fm=193&f=GIF

  const gl = playGl.glContext;
  const shadowProgram = playGl.createProgram(shadowFragment, shadowVertex);
  const program = playGl.createProgram(fragment, vertex);
  const debugProgram = playGl.createProgram(debugFragment, debugVertex);
  console.log(debugProgram);
  
  const depthFBO = playGl.createFrameBuffer('depth', {
    width: shadowWidth,
    height: shadowHeight
  });
  playGl.clear();
  const near = 1;
  const far = 20;
  const lightProjection = mat4.ortho([], -20, 20, -20, 20, near, far);
  // const lightProjection = mat4.perspective([], Math.PI / 2, shadowWidth / shadowHeight, near, far);

  let lightPostion = [5, 5, 5];
  const lightView = mat4.lookAt([], lightPostion, [0, 0, 0], [0, 1, 0]);
  const lightSpaceMatrix = mat4.multiply([], lightProjection, lightView);
  playGl.use(shadowProgram);
  playGl.setUniform('lightSpaceMatrix', lightSpaceMatrix);
  
  playGl.bindFBO(depthFBO);
  gl.viewport(0, 0, shadowWidth, shadowHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.FRONT);
  await renderScene(playGl);
  // gl.cullFace(gl.BACK);
  // gl.disable(gl.CULL_FACE);
  playGl.setDefaultFBO();
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  playGl.use(program);
  const projection = mat4.perspective([], Math.PI / 2, width / height, 1, 1000);
  playGl.setUniform('projection', projection);
  playGl.setUniform('shadowMap', depthFBO.texture);
  playGl.setUniform('textureSize', [shadowWidth, shadowHeight]);
  playGl.setUniform('lightSpaceMatrix', lightSpaceMatrix);
  playGl.setUniform('lightPos', lightPostion);

  let time = 0;
  const radius = 6;
  renderScene(playGl); 
  function updateCamera() {
    time++;
    const x = Math.sin(time / 100) * radius;
    const y = Math.cos(time / 100) * radius;
    let viewPosition = [x, 1, y];
    const view = mat4.lookAt([], viewPosition, [0, 0, 0], [0, 1, 0]);
    playGl.setUniform('view', view);
    playGl.setUniform('viewPos', viewPosition);

    playGl.render();
  
    requestAnimationFrame(updateCamera);
  }

  updateCamera();
})();