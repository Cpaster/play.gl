import PlayGL from '../../src/core';

import createQuadratic from '../../src/geometry/quadratic';

import { PerspectiveCamera } from '../../src/camera';

// import vertex from './vertex.glsl';
// import fragment from './fragment.glsl';

import particleFragment from './particleFragment.glsl';
import particleVertex from './particleVertex.glsl';

import * as mat4 from '../../src/math/mat4';

const canvas = document.getElementById('page');

// class Particle {
//   private _amount: number;
//   private _particles: Array<any> = [];
//   private lastUsedParticle: number = 0;
//   constructor( amount: number) {
//     this._amount = amount;
//     this.init();
//   }
//   init() {
//     for (let i = 0; i < this._amount; i++) {
//       this._particles.push({
//         life: 0,
//         Velocity: 1,
//         position: [1, 1],
//         color: [1, 1, 1, 1]
//       });
//     }
//   }
//   update(dt: number, newParticles: number, offset: [number, number]) {
//     for (let i = 0; i < newParticles; i++ ) {
//       let unusedParticle = this.firstUnusedParticle();
//       this.respawnParticle(this._particles[unusedParticle], offset);
//     }
//     for (let k = 0; k < this._amount; k++) {
//       let paticle = this._particles[k];
//       paticle.life -= dt;
//       if (paticle.life > 0) {
//         let position =  paticle.position;
//         paticle.position = [position[0] - paticle.Velocity * dt, position[1] - paticle.Velocity * dt,];
//         let color =  paticle.color;
//         paticle.color = [color[0] - dt * 2.5, color[1] - dt * 2.5, color[2] - dt * 2.5, 1];
//       }
//     }
//   }
//   firstUnusedParticle() {
//     for (let i = this.lastUsedParticle; i < this._amount; i++) {
//       if (this._particles[i].life <= 0) {
//         this.lastUsedParticle = i;
//         return i;
//       }
//     }
//     for (let k = 0; k < this.lastUsedParticle; k++) {
//       if (this._particles[k].life <= 0) {
//         this.lastUsedParticle = k;
//         return k;
//       }
//     }
//     this.lastUsedParticle = 0;
//     return 0;
//   }

//   respawnParticle(particle, offset: [number, number]) {
//     let random = ((Math.random() % 100) - 50) / 100;
//     let color = 0.5 + (Math.random() % 100) / 100;
//     let position = [(random + offset[0]), (random + offset[1])];
//     particle.position = position;
//     particle.color = [color, color, color, 1.0];
//     particle.life = 1.0;
//     particle.Velocity = 2 * 0.1;
//   }

//   getParticles() {
//     return this._particles;
//   }
// }

function createFontPlane(text, width, height) {
  const textCtx = document.createElement('canvas').getContext('2d');
  textCtx.clearRect(0, 0, width, height);
  textCtx.canvas.width = width;
  textCtx.canvas.height = height;
  textCtx.font = '12px monospace';
  textCtx.textAlign = 'center';
  textCtx.textBaseline = 'middle';
  textCtx.fillStyle = '#fff';
  textCtx.fillText(text, width / 2, height / 2);
  return textCtx.canvas;
}

function addQuad(playGl, params: {
  useBlend: boolean;
  instanceCount?: number
}) {
  const quad = createQuadratic({
    width: 2,
    height: 2
  });
  playGl.addMeshData({
    mod: playGl.glContext[quad.mod],
    positions: quad.position,
    textureCoord: quad.textureCoord,
    cells: quad.cells,
    ...params
  });
}

(async function() {
  const playGl = new PlayGL(canvas);

  playGl.clear();

  const textCanvas = createFontPlane('wangmengdong', 100, 50);

  const {width, height} = canvas.getBoundingClientRect();

  const camera = new PerspectiveCamera(Math.PI / 2, width / height, 0.1, 50);

  camera.position({
    x: 0,
    y: 0,
    z: 10,
  });
  camera.updateCamera();
  
  playGl.clear();

  // const program = playGl.createProgram(fragment, vertex);
  const particleProgram = playGl.createProgram(particleFragment, particleVertex);

  const fontTexture = await playGl.loadTexture(textCanvas);

  let model = [];

  playGl.use(particleProgram);

  addQuad(playGl, {
    useBlend: true
  });

  mat4.translate(
    model,
    mat4.create(),
    [0, 0, 0]
  );

  playGl.setUniform('font', fontTexture);
  playGl.setUniform('projection', camera.projectionMatrix);
  playGl.setUniform('view', camera.viewMatrix);
  playGl.setUniform('model', model);

  // playGl.draw();

  // playGl.use(program);

  // mat4.translate(
  //   model,
  //   mat4.create(),
  //   [0, 0, 0]
  // );

  // addQuad(playGl, {
  //   useBlend: true
  // });
  // playGl.setUniform('font', fontTexture);
  // playGl.setUniform('projection', camera.projectionMatrix);
  // playGl.setUniform('view', camera.viewMatrix);
  // playGl.setUniform('model', model);

  // playGl.draw();

  // const particle = new Particle(500);

  playGl.use(particleProgram);
  let time = 0;
  // let t = 0;
  function update() {
    time += 1;
    // t++;
    // camera.position({
    //   x: 20 * Math.sin(t * 0.5),
    //   y: 0,
    //   z: 20 * Math.cos(t * 0.5),
    // });
    // camera.updateCamera();
    // console.log(camera.viewMatrix);
    // playGl.setUniform('view', camera.viewMatrix);

    if (time < 5000) {
      const thete = Math.random() * 2 * Math.PI;
      const u = Math.random() * 2 * Math.PI;
      playGl.setUniform('offset', [10 * Math.cos(thete), 10 * Math.sin(thete) * Math.cos(u), Math.sin(u)]);
      playGl.setUniform('color', [Math.random(), Math.random(), Math.random(), 1]);
      playGl.draw();
    }
    playGl.draw();
    requestAnimationFrame(update);
  }

  update();

})()