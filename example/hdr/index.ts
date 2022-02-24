import PlayGL from '../../src/core';

const canvas = document.getElementById('page');

(async function() {
  const playGl = new PlayGL(canvas);

  playGl.clear();

  const program = playGl.createProgram();

  playGl.use(program);

  const hdrTexture = await playGl.loadTexture('./example/hdr/img/snowPhoto.hdr');
  // const hdrTexture = await playGl.loadTexture('./example/hdr/img/box.jpg');
  console.log(hdrTexture);
})()
