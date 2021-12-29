import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';
import {arrayToBuffer} from '../../src/core/utils/helper';

import vertexShader from './vertex.glsl';
import framentRedShader from './framgent_red.glsl';
import vertexGreenShader from './framgent_green.glsl';

const canvas = document.getElementById('page');

(async function() {
  const { width, height } = canvas.getBoundingClientRect();

  const playGl = new PlayGL(canvas, {
    isWebGL2: true
  });

  const gl = playGl.gl as WebGL2RenderingContext;

  const programRed = playGl.createProgram(framentRedShader, vertexShader);
  const programGreen = playGl.createProgram(vertexGreenShader, vertexShader);

  const numUniforms = gl.getProgramParameter(programRed, gl.ACTIVE_UNIFORMS);
  console.log(numUniforms);
  const indices = [...Array(numUniforms).keys()];
  const blockIndices = gl.getActiveUniforms(programRed, indices, gl.UNIFORM_BLOCK_INDEX);
  const offsets = gl.getActiveUniforms(programRed, indices, gl.UNIFORM_OFFSET);

  function isBuiltIn(info) {
    const name = info.name;
    return info.name.startsWith("gl_") || info.name.startsWith("webgl_");
  }

  function glEnumToString(gl, value) {
    const keys = [];
    for (const key in gl) {
      if (gl[key] === value) {
        keys.push(key);
      }
    }
    return keys.length ? keys.join(' | ') : `0x${value.toString(16)}`;
  }

  for (let ii = 0; ii < numUniforms; ++ii) {
    const uniformInfo = gl.getActiveUniform(programRed, ii);
    if (isBuiltIn(uniformInfo)) {
        continue;
    }
    const {name, type, size} = uniformInfo;
    const blockIndex = blockIndices[ii];
    const offset = offsets[ii];
    console.log(
       name, size, glEnumToString(gl, type),
       blockIndex, offset);
  }
  // const numUniforms1 = gl.getProgramParameter(programGreen, gl.ACTIVE_UNIFORMS);
  // console.log(numUniforms1);

  const positions = [
    [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5,-0.5], [-0.5, -0.5, -0.5],
    [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5,0.5], [-0.5, -0.5, 0.5],
    [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5,0.5], [-0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5],
    [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [-0.5, -0.5,0.5], [-0.5, -0.5, -0.5],
    [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]
  ];

  const redBlockId = gl.getUniformBlockIndex(programRed, 'Matrices');
  const greenBlockId = gl.getUniformBlockIndex(programGreen, 'Matrices');

  gl.uniformBlockBinding(programRed, redBlockId, 0);
  gl.uniformBlockBinding(programGreen, greenBlockId, 0);

  const blockBuffer = gl.createBuffer();
  gl.bindBuffer(gl.UNIFORM_BUFFER, blockBuffer);

  // gl.bindBuffer(gl.UNIFORM_BUFFER, null);

  gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, blockBuffer);
  gl.bufferData(gl.UNIFORM_BUFFER, 512, gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.UNIFORM_BUFFER, null);

  // perspective
  const perspectiveMatix = [];
  mat4.perspective(perspectiveMatix, Math.PI / 3, width / height, 0.1, 100);

  // view
  const view = [];
  let viewPosition = [0, 0, 3];
  mat4.lookAt(view, viewPosition, [0, 0, 0], [0, 1, 0]);
  var data = new Float32Array(1);
  data[0] = 1.0;
  // gl.bindBuffer(gl.UNIFORM_BUFFER, blockBuffer);
  // gl.bufferSubData(gl.UNIFORM_BUFFER, 0, data);
  // gl.bindBuffer(gl.UNIFORM_BUFFER, null);
  // console.log(pointsToBuffer);
  // var data2 = new Float32Array(1);
  // data2[0] = 0.1;
  gl.bindBuffer(gl.UNIFORM_BUFFER, blockBuffer);
  gl.bufferSubData(gl.UNIFORM_BUFFER, 80, arrayToBuffer(perspectiveMatix));
  gl.bufferSubData(gl.UNIFORM_BUFFER, 16, arrayToBuffer(view));
  gl.bufferSubData(gl.UNIFORM_BUFFER, 0, data);
  // gl.bufferSubData(gl.UNIFORM_BUFFER, 0, arrayToBuffer(view));
  gl.bindBuffer(gl.UNIFORM_BUFFER, null);
  // gl.bufferSubData(gl.UNIFORM_BUFFER, 16, pointsToBuffer(view, Float32Array));

  playGl.use(programRed);
  playGl.addMeshData({
    positions
  });
  // model
  playGl.setUniform('model', mat4.rotate([], mat4.create(), Math.PI / 4, [1, 1, 0]));
  playGl.draw();

  playGl.use(programGreen);
  playGl.addMeshData({
    positions
  });
  // model
  playGl.setUniform('model', mat4.rotate([], mat4.create(), Math.PI / 2, [1, 1, 0]));
  playGl.draw();
  
})();

