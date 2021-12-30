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
      [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 0],
      [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 0],
      [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
      [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
    ],
    attributes: {
      aNormal: {
        data: [
          [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1],
          [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],
          [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
          [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
          [0, -1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0],
          [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]
        ]
      }
    }
  });

  // set MVP
  const {width, height} = canvas.getBoundingClientRect();

  const perspectiveMatix = [];
  const view = [];
  const model = [];

  mat4.perspective(perspectiveMatix, Math.PI / 4, width / height, 0.1, 100);
  mat4.rotate(model, mat4.create(), Math.PI / 4, [1, 1, 0]);

  let viewPosition = [0, 0, 3];
  mat4.lookAt(view, viewPosition, [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('view', view);
  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('model', model);

  // 添加光照效果
  const diffuseTexture = await playGl.loadTexture('./example/textureLight/img/box.jpg');
  const specularTexture = await playGl.loadTexture('./example/textureLight/img/box_specular.png');
  playGl.setUniform('material.diffuse', diffuseTexture);
  playGl.setUniform('material.specular', specularTexture);

  playGl.setUniform('material.shininess', 32.0);

  playGl.setUniform('light.position', [0, 0, 3.0]);
  playGl.setUniform('light.diffuse', [0.5, 0.5, 0.5]);
  playGl.setUniform('light.ambient', [0.2, 0.2, 0.2]);
  playGl.setUniform('light.specular', [1.0, 1.0, 1.0]);
  playGl.setUniform('light.constant', 1.0);
  playGl.setUniform('light.linear', 0.045);
  playGl.setUniform('light.quadratic', 0.0075);
  
  // float constant;
  // float linear;
  // float quadratic;

  // let time = 0;

  const cubePositions: Array<Array<number>> = [
    [0, 0, 0],
    [2.0, 5.0, -15.0],
    [-1.5, -2.2, -2.5],
    [-3.8, -2.0, -12.3],
    [2.4, -0.4, -3.5],
    [-1.7, 3.0, -7.5],
    [1.3, -2.0, -2.5],
    [1.5, 2.0,-2.5],
    [1.5, 0.2, -1.5],
    [-1.3, 1.0, -1.5]
  ];

  cubePositions.forEach((pos: [number, number, number], index: number) => {
    let newModel = mat4.translate([], mat4.create(), pos);
    newModel = mat4.rotate([], newModel, index * 20.0, [0, 0, 1]);
    const normalModel = mat4.transpose([], mat4.invert([], newModel));
    playGl.setUniform('model', newModel);
    playGl.setUniform('normalModel', normalModel);
    playGl.draw();
  });

  // let time = 0;
  // const radius = 4;

  // function updateCamera() {
  //   time++;
  //   const x = Math.sin(time / 100) * radius;
  //   const z = Math.cos(time / 100) * radius;
  //   let viewPosition = [x * 10, 0, z * 10];
  //   // mat4.lookAt(view, viewPosition, [0, 0, 0], [0, 1, 0]);
  //   playGl.setUniform('light.position', viewPosition);
  //   playGl.render();
  //   // playGl.setUniform('view', view);
  //   cubePositions.forEach((pos: [number, number, number], index: number) => {
  //     let newModel = mat4.translate([], mat4.create(), pos);
  //     newModel = mat4.rotate([], newModel, index * 20.0, [0, 0, 1]);
  //     const normalModel = mat4.transpose([], mat4.invert([], newModel));
  //     playGl.setUniform('model', newModel);
  //     playGl.setUniform('normalModel', normalModel);
  //     playGl.draw();
  //   });
  //   requestAnimationFrame(updateCamera);
  // }

  // updateCamera();

})();