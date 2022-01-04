import PlayGL from '../../src/core';
// import {arrayToBuffer} from '../../src/core/utils/helper';
import { createCube, createPlane } from '../common/geometry';
import LightCluster from '../common/lights';
import * as mat4 from '../../src/math/mat4';

import shadowFragment from './shadow_fragment.glsl';
import shadowVertex from './shadow_vertex.glsl';

import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

import debugFragment from './debug_fragment.glsl';
import debugVertex from './debug_vertex.glsl';

const canvas = document.getElementById('page');

const lightPostion = [40, 50, 0];

const viewPosition = [19, 2, 5];

const shadowWidth = 1024;
const shadowHeight = 1024;

function renderScene(playGl: PlayGL) {
  const planeGeo = createPlane(playGl, 25.0);
  planeGeo.setMeshUniform('model', mat4.create());
  planeGeo.setMeshUniform('normalModel', mat4.create());

  const cube1Model = mat4.translate([], mat4.create(), [10, 0, 0]);
  const cube1Geo = createCube(playGl, 1);
  cube1Geo.setMeshUniform('model', cube1Model);
  planeGeo.setMeshUniform('normalModel', mat4.transpose([], mat4.invert([], cube1Model)));

  const cube2Model = mat4.scale(
    [],
    mat4.translate([], mat4.create(), [2, 0, 1]),
    [0.5, 0.5, 0.5]
  );
  
  const cube2Geo = createCube(playGl, 1);
  cube2Geo.setMeshUniform('model', cube2Model);
  cube2Geo.setMeshUniform('normalModel', mat4.transpose([], mat4.invert([], cube2Model)));

  const cube3Model = mat4.scale(
    [],
    mat4.rotate(
      [], 
      mat4.translate([], mat4.create(), [-1, 0, 2]),
      Math.PI / 3,
      [-1, 0, 2]
    ),
    [0.5, 0.5, 0.5]
  );
  const cube3Geo = createCube(playGl, 1);

  cube3Geo.setMeshUniform('model', cube3Model);
  cube3Geo.setMeshUniform('normalModel', mat4.transpose([], mat4.invert([], cube3Model)));
  playGl.render();
}

(async function() {
  const {width, height} = canvas.getBoundingClientRect();
  const playGl = new PlayGL(canvas);

  const gl = playGl.glContext;
  const shadowProgram = playGl.createProgram(shadowFragment, shadowVertex);
  const program = playGl.createProgram(fragment, vertex);
  const debugProgram = playGl.createProgram(debugFragment, debugVertex);
  console.log(debugProgram);
  
  playGl.clear();
  const near = 1;
  const far = 7.5;
  const lightProjection = mat4.ortho([], -10.0, 10.0, -10.0, 10.0, near, far);
  const lightView = mat4.lookAt([], lightPostion, [0, 0, 0], [0, 1, 0]);
  const lightSpaceMatrix = mat4.multiply([], lightView, lightProjection);

  playGl.use(shadowProgram);
  playGl.setUniform('lightSpaceMatrix', lightSpaceMatrix);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, shadowWidth, shadowHeight);

  const depthFBO = playGl.createFrameBuffer('depth', {
    width: shadowWidth,
    height: shadowHeight
  });
  
  playGl.bindFBO(depthFBO);
  renderScene(playGl);
  playGl.setDefaultFBO();

  gl.viewport(0, 0, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // playGl.clear();

  playGl.use(program);
  // add Light
  const light = new LightCluster(playGl, false);
  light.addPointLight({
    position: lightPostion as Vec3,
    ambient: [1, 1, 1],
    diffuse: [1, 1, 1],
    specular: [1.0, 1.0, 1.0]
  });
  light.add();

    const texture = await playGl.loadTexture('./example/common/img/wall.jpg', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  });

  const projection = mat4.perspective([], Math.PI / 2, width / height, 0.1, 100);
  const view = mat4.lookAt([], viewPosition, [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('projection', projection);
  playGl.setUniform('view', view);
  playGl.setUniform('diffuseTexture', texture);
  playGl.setUniform('shadowMap', depthFBO.texture);
  playGl.setUniform('lightSpaceMatrix', lightSpaceMatrix);
  playGl.setUniform('viewPos', viewPosition);
  playGl.setUniform('lightPos', lightPostion);
  // render
  renderScene(playGl); 
})();