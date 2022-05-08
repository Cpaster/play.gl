import PlayGL from '../../src/core';

import particleVertex from './particleVertex.glsl';
import particleFragment from './particleFragment.glsl';
import renderFragment from './renderFragment.glsl';
import renderVertex from './renderVertex.glsl';

const canvas = document.getElementById('page');

const particleTexture =`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QYTCCY1R1556QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAC4ElEQVRYw8VXa4/aMBAcB0OgB0ff///vVWpV0UAOcBz3w832hr0EyLVSLa0S7mLPePbhdcAbRykl2HsIobx1nTARMIzMVQJlCqEwATgAmMmcSj7rhUjm8y4iYQLwjKDxCoGO7/leIuEKeCXAkTZzZiM762j2ux8jEW+Az2kRwIIWxSA7NzvTZgCSrDtIIt4Ar/lcAVjSjNBcpiaCJwBH2pNz0yCJOOASBV/yueb7O5qpYcN23YpqAcDJC+wy5oXAwO4XBH0AsAGwJZG1/M/GkQT2tJ1sqFcrpVwEpSpQSZSb7Ab+HsAHIbKhMjZOABr+bTFQI7LLjHxBQFLO734l4F8APPK5ohI29iRWO2U0MC07+mcRnlWIIpWmXS0+3xB4C+ArgM/iCiWw5xrm+44xkfjbMiPTHYMEouT9gi5YO/BPVMRSsuM3P51LLCae3LqdumgsC6LLhC3VeATwkU9LSUu9wPeW3zeSxtGV8ZcsEP9X4oYosVC7gKxJ5kEIVNz1hsArCUglYBjB4iCOlGe1SpSpJM9tdxXlnssGdJ7a7VJ8x7Ag6giiB9DkEUMIpZRSXMHIUlq1yrUMOPW5xUCSb2xOkkNJ1y8+Df0OFdyKzJZRXYvPo+T5TqK+kUxQEqMusBrdOQItgAMXX4p/E4MwcN6BoD8AfOf3B6kDuu7FeaAEtJE40Vou7Gv/nhFvo6EbvhG8obWyVvZF6A8BxoH5J3GnR/5/5ypcIvjOHUYNi5E9d3THUVzR++YkurbKy++7prP425+GRmJPAr/43g4E4+s0pAomU5KioQfLgTbWD+wlE8wtploGkG81JBaIcOc5JNq16dCOyLLGuqFWsihJAI4XIlEBzjW9LB6lvKo6BnISRS7S8GZPOEJCY+N8R1fciSL5Gvg99wJ/QFUi/dC9IEmZzkNR/5abUTVwII0R6KXt6kMI/T+5G7pbUrhyNyxTrmWTLqcDt+JXBP7mlvzfxm8amZhMH7WSmQAAAABJRU5ErkJggg==`;

function randomRGData(size_x, size_y) {
  let d = [];
  for (let i = 0; i < size_x * size_y; ++i) {
   d.push(Math.random() * 255.0);
   d.push(Math.random() * 255.0);
   d.push(Math.random() * 255.0);
  }
  return {
    pixels: new Uint8Array(d),
    width: size_x,
    height: size_y
  };
}

function initSpriteData() {
  return new Float32Array([
    1, 1, 
    1, 1, 
    -1, 1, 
    0, 1, 
    -1, -1, 
    0, 0, 
    1, 1, 
    1, 1, 
    -1, -1, 
    0, 0, 
    1, -1,
    1, 0
  ]);
}

function initialParticleData(num_parts, min_age, max_age) {
  let data = [];
  for (let i = 0; i < num_parts; ++i) {
    // position
    data.push(0.0);
    data.push(0.0);

    let life = min_age + Math.random() * (max_age - min_age);
    data.push(life + 1);
    data.push(life);

    data.push(0.0);
    data.push(0.0);
  }

  return data;
}

const updateParticleVarying = {
  i_Position: {
    dimension: 2,
    type: 'FLOAT',
    stride: 4 * 6
  },
  i_Age: {
    dimension: 1,
    type: 'FLOAT',
    stride: 4 * 6
  },
  i_Life: {
    dimension: 1,
    type: 'FLOAT',
    stride: 4 * 6
  },
  i_Velocity: {
    dimension: 2,
    type: 'FLOAT',
    stride: 4 * 6
  }
};

const renderVarying = {
  i_Position: {
    dimension: 2,
    type: 'FLOAT',
    stride: 4 * 6,
    divisor: 1
  },
  i_Age: {
    dimension: 1,
    type: 'FLOAT',
    stride: 4 * 6,
    divisor: 1
  },
  i_Life: {
    dimension: 1,
    type: 'FLOAT',
    stride: 4 * 6,
    divisor: 1
  }
};

const spriteVarying = {
  i_Coord: {
    dimension: 2,
    type: 'FLOAT',
    stride: 4 * 4
  },
  i_TexCoord: {
    dimension: 2,
    type: 'FLOAT',
    stride: 4 * 4
  }
}

function init(playGl: PlayGL, options) {
  const { particlesNum, lifeRange } = options;
  const gl = playGl.glContext;

  const particleProgram = playGl.createProgram(particleFragment, particleVertex, {
    transform_feedback_varyings: [
      "v_Position",
      "v_Age",
      "v_Life",
      "v_Velocity"
    ],
    setAttributeBuffer: false
  });

  const renderProgram = playGl.createProgram(renderFragment, renderVertex, {
    setAttributeBuffer: false
  });

  const initialData = new Float32Array(initialParticleData(particlesNum, lifeRange[0], lifeRange[1]));

  const buffer1 = playGl.createBuffer(initialData);
  const buffer2 = playGl.createBuffer(initialData);
  const spriteBuffer = playGl.createBuffer(initSpriteData());
  
  playGl.use(particleProgram);

  const updateVAO1 = playGl.addBufferVAO([{
    buffer: buffer1,
    attribs: updateParticleVarying,
    typeSize: 4
  }]);

  const updateVAO2 = playGl.addBufferVAO([{
    buffer: buffer2,
    attribs: updateParticleVarying,
    typeSize: 4
  }]);

  playGl.use(renderProgram);

  const renderVAO1 = playGl.addBufferVAO([{
    buffer: buffer1,
    attribs: renderVarying,
    typeSize: 4
  }, {
    buffer: spriteBuffer,
    attribs: spriteVarying,
    typeSize: 4
  }]);

  const renderVAO2 = playGl.addBufferVAO([{
    buffer: buffer2,
    attribs: renderVarying,
    typeSize: 4
  }, {
    buffer: spriteBuffer,
    attribs: spriteVarying,
    typeSize: 4
  }]);

  const textureData = randomRGData(512, 512);

  const rgNoiseTexture = playGl.createTexture(gl.TEXTURE_2D, [textureData], {
    wrapS: 'MIRRORED_REPEAT',
    wrapT: 'MIRRORED_REPEAT',
    minFilter: 'NEAREST',
    magFilter: 'NEAREST',
    format: 'RGB'
  });
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  return {
    vaos: [
      updateVAO1,
      updateVAO2,
      renderVAO1,
      renderVAO2
    ],
    buffers: [
      buffer1, buffer2
    ],
    rgNoiseTexture,
    read: 0,
    write: 1,
    updateProgram: particleProgram,
    renderProgram: renderProgram,
    particlesNum: initialData.length / 6,
    oldTimeStamp: 0.0,
    totalTime: 0.0,
    bornParticles: 0,
    birthRate: options?.birthRate,
    gravity: options?.gravity,
    origin: [0.0, 0.0],
    minTheta: options?.directionRange[0],
    maxTheta: options?.directionRange[1],
    minSpeed: options?.speedRange[0],
    maxSpeed: options?.speedRange[1],
    time: 0.0
  }
}

function render(playGl: PlayGL, state, timestamp_millis) {
  const numPart = state?.bornParticles;
  const gl = playGl.glContext as WebGL2RenderingContext;

  let timeDelta = 0.0;
  if (state?.oldTimeStamp != 0) {
    timeDelta = timestamp_millis - state?.oldTimeStamp;
    if (timeDelta > 500) {
      timeDelta = 0.0;
    }
  }

  if (state?.bornParticles < state?.particlesNum) {
    state.bornParticles = Math.min(
      state?.particlesNum,
      Math.floor(state.bornParticles + state?.birthRate * timeDelta)
    );
  }

  state.oldTimeStamp = timestamp_millis;
  playGl.clear({
    color: [0, 0, 0, 1]
  });
  playGl.use(state.updateProgram);
  state.time += timeDelta / 1000.0;
  playGl.setUniform('u_TimeDelta', timeDelta / 1000.0);
  playGl.setUniform('u_Time', state.time);
  playGl.setUniform('u_TotalTime', state.totalTime);
  playGl.setUniform('u_Gravity', state.gravity);
  playGl.setUniform('u_Origin', state.origin);
  playGl.setUniform('u_MinTheta', state.minTheta);
  playGl.setUniform('u_MaxTheta', state.maxTheta);
  playGl.setUniform('u_MinSpeed', state.minSpeed);
  playGl.setUniform('u_MaxSpeed', state.maxSpeed);
  
  gl.bindVertexArray(state.vaos[state.read]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, state.buffers[state.write]);
  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  numPart && gl.drawArrays(gl.POINTS, 0, numPart);
  gl.endTransformFeedback();
  gl.disable(gl.RASTERIZER_DISCARD);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
  gl.bindVertexArray(state.vaos[state.read + 2]);
  playGl.use(state.renderProgram);
  // numPart && gl.drawArrays(gl.POINTS, 0, numPart);
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, numPart);

  let tmp = state.read;
  state.read = state.write;
  state.write = tmp;
  
  window.requestAnimationFrame(function(ts) {
    render(playGl, state, ts);
  })
}

(async function() {
  const playGl = new PlayGL(canvas, {
    isWebGL2: true
  });

  const state = init(playGl, {
    particlesNum: 10000,
    birthRate: 0.5,
    lifeRange: [0,8, 0.9],
    directionRange: [ - Math.PI, Math.PI / 2],
    speedRange: [0.1, 0.5],
    gravity: [0.0, -0.0]
  });

  const forceFieldTexture = await playGl.loadTexture('./example/particle_webgl2/img/rgperlin.jpg');
  const spriteTexture = await playGl.loadTexture(particleTexture);

  canvas.onmousemove = function(e) {
    const {width, height} = canvas.getBoundingClientRect();
    let x = 2.0 * (e.pageX - canvas.offsetLeft) / width - 1.0;
    let y = - (2.0 * (e.pageY - canvas.offsetTop) / height - 1.0);
    state.origin = [x, y];
  }

  playGl.use(state.updateProgram);
  playGl.setUniform('u_RgNoise', state.rgNoiseTexture);
  playGl.setUniform('u_ForceField', forceFieldTexture);
  playGl.use(state.renderProgram);
  playGl.setUniform('u_Sprite', spriteTexture);

  window.requestAnimationFrame(function(ts) {
    render(playGl, state, ts);
  })
  
})()