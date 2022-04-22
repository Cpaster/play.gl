import PlayGL from '../../src/core';

import particleVertex from './particleVertex.glsl';
import particleFragment from './particleFragment.glsl';
import renderFragment from './renderFragment.glsl';
import renderVertex from './renderVertex.glsl';

const canvas = document.getElementById('page');

function randomRGData(size_x, size_y) {
  let d = [];
  for (let i = 0; i < size_x * size_y; ++i) {
   d.push(Math.random() * 255.0);
   d.push(Math.random() * 255.0);
  }
  return {
    pixels: new Uint8Array(d),
    width: size_x,
    height: size_y
  };
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
    stride: 4 * 6
  }
};

function init(playGl: PlayGL, options) {
  const { particlesNum, lifeRange } = options
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
  
  playGl.use(particleProgram);
  const updateVAO1 = playGl.addBufferVAO(buffer1, updateParticleVarying);
  const updateVAO2 = playGl.addBufferVAO(buffer2, updateParticleVarying);

  playGl.use(renderProgram);
  const renderVAO1 = playGl.addBufferVAO(buffer1, renderVarying);
  const renderVAO2 = playGl.addBufferVAO(buffer2, renderVarying);

  const textureData = randomRGData(512, 512);

  const rgNoiseTexture = playGl.createTexture(gl.TEXTURE_2D, [textureData], {
    wrapS: 'MIRRORED_REPEAT',
    wrapT: 'MIRRORED_REPEAT',
    minFilter: 'NEAREST',
    magFilter: 'NEAREST',
    format: 'RG'
  });

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
  playGl.setUniform('u_TimeDelta', timeDelta / 1000.0);
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
  numPart && gl.drawArrays(gl.POINTS, 0, numPart);

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
    particlesNum: 300000,
    birthRate: 0.5,
    lifeRange: [1.01, 1.15],
    directionRange: [Math.PI / 2.0 -0.5, Math.PI / 2.0 + 0.5],
    speedRange: [0.5, 1.0],
    gravity: [0.0, -0.8]
  });

  canvas.onmousemove = function(e) {
    const {width, height} = canvas.getBoundingClientRect();
    let x = 2.0 * (e.pageX - canvas.offsetLeft) / width - 1.0;
    let y = - (2.0 * (e.pageY - canvas.offsetTop) / height - 1.0);
    state.origin = [x, y];
  }

  playGl.use(state.updateProgram);
  playGl.setUniform('u_RgNoise', state.rgNoiseTexture);

  window.requestAnimationFrame(function(ts) {
    render(playGl, state, ts);
  })

  console.log(state);
  
})()