import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';

import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';

const canvas = document.getElementById('page');

(async function() {
  const playGl = new PlayGL(canvas);

  playGl.clear();

  const program = playGl.createProgram(framentShader, vertexShader);

  playGl.use(program);

  const { width, height } = canvas.getBoundingClientRect();

  const perspectiveMatix = [];
  const view = [];

  mat4.lookAt(view, [1, 1, 8], [0, 0, 0], [0, 1, 0]);

  mat4.perspective(perspectiveMatix, Math.PI / 6, width / height, 0.1, 100);
  playGl.setUniform('view', view);
  playGl.setUniform('projection', perspectiveMatix);

  const planeTexture = await playGl.loadTexture('./example/blend/img/metal.png', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  });
  const wallTexture = await playGl.loadTexture('./example/blend/img/wall.jpg', {
    wrapS: 'REPEAT',
    wrapT: 'REPEAT'
  });

  // const grassTransport = await playGl.loadTexture('./example/blend/img/grass.png');
  const windowTransportTexture = await playGl.loadTexture('./example/blend/img/window.png');

  // plane
  const planeMesh = playGl.addMeshData({
    positions: [
      [5.0, -0.5, 5.0], [-5.0, -0.5,  5.0], [-5.0, -0.5, -5.0],
      [5.0, -0.5, 5.0], [-5.0, -0.5, -5.0], [5.0, -0.5, -5.0]
    ],
    textureCoord: [
      [2, 0], [0, 0], [0, 2], [2, 0], [0, 2], [2, 2],
    ],
    uniforms: {
      texture1: planeTexture
    }
  });
  const model = [];
  mat4.translate(model, mat4.create(), [0, 0, 0]);
  planeMesh.setMeshUniform('model', model);

  playGl.draw();

  // box
  // playGl.setUniform('texture1', wallTexture);
  const boxMesh = playGl.addMeshData({
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
      [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 0],
      [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 0],
      [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
      [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
    ],
    uniforms: {
      texture1: wallTexture
    },
    // useCullFace: true
  });

  // grass
  const grassMesh = playGl.addMeshData({
    positions: [
      [0, 0.5, 0], [0, -0.5,  0], [1, -0.5, 0],
      [0, 0.5, 0], [1, -0.5, 0], [1, 0.5, 0]
    ],
    textureCoord: [
      [0, 1], [0, 0], [1, 0], [0, 1], [1, 0], [1, 1],
    ],
    uniforms: {
      // texture1: grassTransport
      texture1: windowTransportTexture
    },
    useBlend: true
  })

  const grassPosition: Array<[number, number, number]> = [
    [0, 0, 4],
    [0.5, 0, 5]
  ];

  const boxPosition: Array<[number, number, number]> = [
    [0, 0, 0],
    [2.0, 0, -2]
  ];

  let time = 0;
  const radius = 10;

  function updateCamera() {
    time++;
    playGl.clear();
    grassPosition.forEach(pos => {
      const model = [];
      mat4.translate(model, mat4.create(), pos);
      grassMesh.setMeshUniform('model', model);
      playGl.draw();
    });
    console.log(boxMesh);
    console.log(boxPosition);
    // boxPosition.forEach(arr => {
    //   const model = [];
    //   mat4.translate(model, mat4.create(), arr);
    //   boxMesh.setMeshUniform('model', model);
    //   playGl.draw();
    // })
    const x = Math.sin(time / 200) * radius;
    const z = Math.cos(time / 200) * radius;
    mat4.lookAt(view, [x, 0, z], [0, 0, 0], [0, 1, 0]);
    playGl.setUniform('view', view);
    requestAnimationFrame(updateCamera);
  }

  updateCamera();
})()