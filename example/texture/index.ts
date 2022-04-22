import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';

import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';

const canvas = document.getElementById('page');

function randomRGData(size_x, size_y) {
  let d = [];
  for (let i = 0; i < size_x * size_y; ++i) {
   d.push(Math.random() * 255.0);
   d.push(Math.random() * 255.0);
  //  d.push(Math.random() * 255.0);
  //  d.push(255.0);
  }
  return {
    pixels: new Uint8Array(d),
    width: size_x,
    height: size_y
  };
 }

(async function() {
  const playGl = new PlayGL(canvas, {
    isWebGL2: true
  });

  playGl.clear();

  const program = playGl.createProgram(framentShader, vertexShader);

  playGl.use(program);

  playGl.addMeshData({
    positions: [
      [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5,-0.5], [-0.5, -0.5, -0.5],
      [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5,0.5], [-0.5, -0.5, 0.5],
      [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5,0.5], [-0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5],
      [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [-0.5, -0.5,0.5], [-0.5, -0.5, -0.5],
      [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]
    ],
    textureCoord: [
      [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0],
      [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0],
      [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 1],
      [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 1],
      [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
      [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
    ],
  })

  const {width, height} = canvas.getBoundingClientRect();

  const perspectiveMatix = [];
  const view = [];
  const model = [];

  mat4.perspective(perspectiveMatix, Math.PI / 4, width / height, 0.1, 100);
  mat4.rotate(model, mat4.create(), Math.PI / 4, [1, 1, 0]);

  // const wallTexture = await playGl.loadTexture('./example/common/img/wall.jpg')
  // const wallTexture = await playGl.loadTexture('./example/common/img/snowPhoto.hdr', {
  //   minFilter: 'NEAREST',
  //   magFilter: 'NEAREST',
  // });

  const textureData = randomRGData(512, 512);
  const gl = playGl.glContext;
  const texture = playGl.createTexture(gl.TEXTURE_2D, [textureData], {
    wrapS: 'MIRRORED_REPEAT',
    wrapT: 'MIRRORED_REPEAT',
    minFilter: 'NEAREST',
    magFilter: 'NEAREST',
    format: 'RG'
  });

  playGl.setUniform('wall', texture);

  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('model', model);

  let time = 0;
  const radius = 4;

  function updateCamera() {
    time++;
    const x = Math.sin(time / 100) * radius;
    const z = Math.cos(time / 100) * radius;
    mat4.lookAt(view, [x, 0, z], [0, 0, 0], [0, 1, 0]);
    playGl.setUniform('view', view);
    playGl.render();
    requestAnimationFrame(updateCamera);
  }

  updateCamera();

  // playGl.render();
  
  // playGl.setUniform('view', view);

})();