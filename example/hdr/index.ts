import PlayGL from '../../src/core';
import { PerspectiveCamera } from '../../src/camera';

import LightCluster from '../common/lights';

import * as mat4 from '../../src/math/mat4';

import createCube from '../../src/geometry/cube';
import createSphere from '../../src/geometry/sphere';
import createQuadratic from '../../src/geometry/quadratic';

import vertexShader from './equirectangular/vertex.glsl';
import framentShader from './equirectangular/fragment.glsl';

import backgroundVertexShader from './backgroud/vertex.glsl';
import backgroundFramentShader from './backgroud/fragment.glsl';

import pbrVertexShader from './pbr/vertexShader.glsl';
import pbrFramentShader from './pbr/fragmentShader.glsl';

import convolutionFramentShader from './convolution/fragmentShader.glsl';

import prefilterCubFramentShader from './prefilter/fragmentShader.glsl';

import brdfVertexShader from './brdf/vertexShader.glsl';
import brdfFragmentShader from './brdf/fragmentShader.glsl';

const canvas = document.getElementById('page');


const caputreViews = [
  {
    position: [0, 0, 0],
    target: [1, 0, 0],
    up: [0, -1, 0]
  }, 
  {
    position: [0, 0, 0],
    target: [-1, 0, 0],
    up: [0, -1, 0]
  }, {
    position: [0, 0, 0],
    target: [0, 1, 0],
    up: [0, 0, 1]
  }, {
    position: [0, 0, 0],
    target: [0, -1, 0],
    up: [0, 0, -1]
  }, {
    position: [0, 0, 0],
    target: [0, 0, 1],
    up: [0, -1, 0]
  }, {
    position: [0, 0, 0],
    target: [0, 0, -1],
    up: [0, -1, 0]
  }
];

function addCube(playGl, size) {
  const cube = createCube({
    xSize: size,
    ySize: size,
    zSize: size
  });
  
  playGl.addMeshData({
    positions: cube.position,
    textureCoord: cube.textureCoord,
    cells: cube.cells,
  });
}

function addQuad(playGl) {
  const quad = createQuadratic({
    width: 2,
    height: 2
  });
  playGl.addMeshData({
    positions: quad.position,
    textureCoord: quad.textureCoord,
    cells: quad.cells,
  });
}

const { width, height } = canvas.getBoundingClientRect();

async function createCubeMap(playGl: PlayGL) {

  const hdrTexture = await playGl.loadTexture('./example/hdr/img/Snow_Bg.jpg', {
    minFilter: 'LINEAR',
    magFilter: 'LINEAR',
    isFlipY: true
  });

  const equirectangularProgram = playGl.createProgram(framentShader, vertexShader);

  playGl.use(equirectangularProgram);
  const cubeMapFBO = playGl.createTextureCubeFrameBuffer();
  
  playGl.bindFBO(cubeMapFBO);

  const camera = new PerspectiveCamera(Math.PI / 2, 1.0, 0.1, 20);
  playGl.setUniform('equirectangularMap', hdrTexture);
  playGl.setUniform('projection', camera.projectionMatrix);

  addCube(playGl, 2);
  caputreViews.forEach(view => {
    const { target, up } = view;
    camera.lookAt({
      x: target[0],
      y: target[1],
      z: target[2]
    });
    camera.up({
      x: up[0],
      y: up[1],
      z: up[2]
    });
    camera.updateCamera();
    playGl.setUniform('view', camera.viewMatrix);

    playGl.render();
  });
  playGl.setDefaultFBO();
  return cubeMapFBO.texture;
}

// 创建天空盒
function createEnvCube(playGl: PlayGL, texture, camera) {

  const backgroundProgram = playGl.createProgram(backgroundFramentShader, backgroundVertexShader);
  playGl.use(backgroundProgram);

  playGl.setUniform('environmentMap', texture);
  playGl.setUniform('projection', camera.projectionMatrix);
  playGl.setUniform('view', camera.viewMatrix);
  addCube(playGl, 2);

  return {
    program: backgroundProgram
  };
}

function createPBRScene(playGl: PlayGL, diffuseCubeMap, camera) {
  const pbrProgram = playGl.createProgram(pbrFramentShader, pbrVertexShader);
  playGl.use(pbrProgram);
  const lightCluster = new LightCluster(playGl, false);
  const lightPos: Array<[number, number, number]> = [
    [-10, 10, 10],
    [10, 10, 10],
    [-10, -10, 10],
    [10, -10, 10]
  ]

  lightPos.forEach(pos => {
    lightCluster.addPointLight({
      position: pos,
      ambient: [0.1, 0.1, 0.1],
      diffuse: [1.0, 1.0, 1.0],
      specular: [1.0, 1.0, 1.0],
      constant: 1.0,
      linear: 0.045,
      quadratic: 0.0075
    });
  })

  lightCluster.add();

  playGl.setUniform('irradianceMap', diffuseCubeMap);

  playGl.setUniform('projection', camera.projectionMatrix);

  playGl.setUniform('materialColor', [300.0, 300.0, 300.0]);

  const nrRows = 7;
  const nrCols = 7;
  const space = 2.5;

  function clamp(v: number, min: number, max: number) {
    if (v > max) {
      return max;
    }
    if (v < min) {
      return min;
    }
    else {
      return v;
    }
  };

  const models = [];
  const metallics = [];
  const roughnesss = [];

  for (let row = 0; row < nrRows; ++row) {
    for (let col = 0; col < nrCols; ++col) {
      metallics.push(row / nrRows);
      roughnesss.push(clamp(col / nrCols, 0.05, 1.0));

      const model = [];
      mat4.translate(
        model,
        mat4.create(),
        [(col - (nrCols / 2)) * space, (row - (nrRows / 2)) * space, 0.0]
      );
      models.push(model);
    }
  }

  playGl.setUniform('albedo', [1, 1, 1]);
  playGl.setUniform('ao', 1.0);

  const sphere = createSphere({
    xSegment: 64,
    ySegment: 64
  });

  playGl.addMeshData({
    instanceCount: models?.length,
    mod: playGl.glContext[sphere.mod],
    positions: sphere.position,
    textureCoord: sphere.textureCoord,
    cells: sphere.cells,
    attributes: {
      aNormal: {
        data: sphere.aNormal
      },
      models: {
        data: models,
        divisor: 1
      },
      metallics: {
        data: metallics,
        divisor: 1
      },
      roughnesss: {
        data: roughnesss,
        divisor: 1
      }
    },
  });

  return {
    program: pbrProgram
  };
}

function createDiffuseCubeMap (playGl: PlayGL, cubeMapTexture) {
  const diffuseProgram = playGl.createProgram(convolutionFramentShader, vertexShader);

  playGl.use(diffuseProgram);

  const cubeMapFBO = playGl.createTextureCubeFrameBuffer();
  
  playGl.bindFBO(cubeMapFBO);

  const camera = new PerspectiveCamera(Math.PI / 2, 1.0, 0.1, 20);

  playGl.setUniform('environmentMap', cubeMapTexture);
  playGl.setUniform('projection', camera.projectionMatrix);

  addCube(playGl, 2);
  caputreViews.forEach(view => {
    const { target, up } = view;
    camera.lookAt({
      x: target[0],
      y: target[1],
      z: target[2]
    });
    camera.up({
      x: up[0],
      y: up[1],
      z: up[2]
    });
    camera.updateCamera();
    playGl.setUniform('view', camera.viewMatrix);

    playGl.render();
  });

  playGl.setDefaultFBO();
  return cubeMapFBO.texture;
}

function createBrdfLUTTexture(playGl: PlayGL) {
  const gl = playGl.glContext;
  const brdfProgram = playGl.createProgram(brdfFragmentShader, brdfVertexShader);
  playGl.use(brdfProgram);
  const textureFBO = playGl.createFrameBuffer();
  addQuad(playGl);
  playGl.bindFBO(textureFBO);
  // const { renderBuffer } = textureFBO;
  // gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
  // gl.renderbufferStorage(gl.RENDERBUFFER, (gl as WebGL2RenderingContext).DEPTH_COMPONENT24, 512, 512);
  gl.viewport(0, 0, 512, 512);
  playGl.render();
  playGl.setDefaultFBO();
  return textureFBO.texture;
}

function createPrefilterMap(playGl: PlayGL, envMapTexture) {
  const gl = playGl.glContext;
  const prefilterMapProgram = playGl.createProgram(prefilterCubFramentShader, vertexShader);
  playGl.use(prefilterMapProgram);
  const cubeMapFBO = playGl.createTextureCubeFrameBuffer({
    closeRenderBuffer: true
  });

  playGl.bindFBO(cubeMapFBO);

  const camera = new PerspectiveCamera(Math.PI / 2, 1.0, 0.1, 20);

  playGl.setUniform('environmentMap', envMapTexture);
  playGl.setUniform('projection', camera.projectionMatrix);
  const renderBuffer = cubeMapFBO.renderBuffer;

  const mipMapLevel = 5;
  addCube(playGl, 2);
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

  gl.bindFramebuffer(gl.FRAMEBUFFER, cubeMapFBO);
  for (let level = 0; level < 1; level++) {
    const width = 128 * Math.pow(0.5, level);
    const height = 128 * Math.pow(0.5, level);
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, (gl as WebGL2RenderingContext).DEPTH_COMPONENT24, width, height);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.viewport(0, 0, width, height);
    const roughness = level / (mipMapLevel - 1);
    playGl.setUniform('roughness', roughness);
    caputreViews.forEach(view => {
      const { target, up } = view;
      camera.lookAt({
        x: target[0],
        y: target[1],
        z: target[2]
      });
      camera.up({
        x: up[0],
        y: up[1],
        z: up[2]
      });
      camera.updateCamera();
      playGl.setUniform('view', camera.viewMatrix);
      playGl.render();
    });
  }
  playGl.setDefaultFBO();
  return cubeMapFBO.texture;
}

(async function() {
  const playGl = new PlayGL(canvas, {
    isWebGL2: true,
    antialias: true
  });

  playGl.clear();

  const cubeMapTexture = await createCubeMap(playGl);
  const camera = new PerspectiveCamera(Math.PI / 2, width / height, 0.1, 100);

  const diffuseCubeMap = await createDiffuseCubeMap(playGl, cubeMapTexture);

  const prefilterCubMap = createPrefilterMap(playGl, cubeMapTexture);

  const brdfLUTTexture = createBrdfLUTTexture(playGl);
  
  const pbrContext = createPBRScene(playGl, diffuseCubeMap, camera);

  const envContext = createEnvCube(playGl, cubeMapTexture, camera);

  let time = 0;

  function update() {
    time++;

    playGl.clear();

    camera.position({
      x: 15 * Math.sin(time * 0.01),
      y: 0 * Math.sin(time * 0.01),
      z: 15 * Math.cos(time * 0.01),
    });
    camera.updateCamera();

    playGl.use(pbrContext.program);
    playGl.setUniform('view', camera.viewMatrix);
    playGl.setUniform('viewPosition', camera.cameraPosition);
    playGl.setUniform('irradianceMap', diffuseCubeMap);
    playGl.setUniform('prefilterMap', prefilterCubMap);
    playGl.setUniform('brdfLUT', brdfLUTTexture);
    playGl.draw();

    const gl = playGl.glContext;
    gl.depthFunc(gl.LEQUAL);
    playGl.use(envContext.program);

    const mat3Views = mat4.fromMat4ToMat3([], camera.viewMatrix);
    const Mat4Views = mat4.toMat4([], mat3Views);
    playGl.setUniform('view', Mat4Views);
    playGl.setUniform('environmentMap', cubeMapTexture);

    playGl.draw();
    gl.depthFunc(gl.LESS);

    requestAnimationFrame(update);
  }

  update();
})()
