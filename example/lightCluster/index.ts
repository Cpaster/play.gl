import PlayGL from '../../src/core';
import * as mat4 from '../../src/math/mat4';

import vertexShader from './vertexShader.glsl';
import framentShader from './fragmentShader.glsl';

import LightCluster from '../common/lights';

const canvas = document.getElementById('page');

(async function() {
  const playGl = new PlayGL(canvas);

  playGl.clear();

  const program = playGl.createProgram(framentShader, vertexShader);

  playGl.use(program);

  const lightCluster = new LightCluster(playGl, false);

  lightCluster.addDirectionLight({
    direction: [0, 0, -1],
    ambient: [0.1, 0.1, 0.1],
    diffuse: [0.8, 0.8, 0.8],
    specular: [1.0, 1.0, 1.0]
  });

  lightCluster.addPointLight({
    position: [0, 0, 1],
    ambient: [0.1, 0.1, 0.1],
    diffuse: [0.8, 0.8, 0.8],
    specular: [1.0, 1.0, 1.0],
    constant: 1.0,
    linear: 0.045,
    quadratic: 0.0075
  });

  lightCluster.addSpotLight({
    position: [0, 0, 1],
    direction: [0, 0, -1],
    cutOff: Math.cos(5.5),
    outCutOff: Math.cos(7.5),
    ambient: [0.1, 0.1, 0.1],
    diffuse: [0.8, 0.8, 0.8],
    specular: [1.0, 1.0, 1.0]
  });

  lightCluster.add();

  // 添加物体
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
  
  mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
  playGl.setUniform('view', view);
  playGl.setUniform('projection', perspectiveMatix);
  playGl.setUniform('model', model);
  

  // 设置物体的材质和物体的光照属性
  const diffuseTexture = await playGl.loadTexture('./example/lightCluster/img/box.jpg');
  const specularTexture = await playGl.loadTexture('./example/lightCluster/img/box_specular.png');
  
  playGl.setUniform('material.diffuse', diffuseTexture);
  playGl.setUniform('material.specular', specularTexture);
  playGl.setUniform('material.shininess', 32.0);

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
})();