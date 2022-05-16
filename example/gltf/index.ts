import PlayGL from '../../src/core';

const canvas = document.getElementById('page');

(async () => {
  const playGl = new PlayGL(canvas);
  playGl.clear();
  const gltf = await playGl.loaderGLTF('./example/gltf/whale.gltf');
  gltf.addMeshData(playGl);
})()