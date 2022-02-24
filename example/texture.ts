import PlayGL from '../src/core';

const canvas = document.getElementById('page');

(async function() {
  const playGl = new PlayGL(canvas);

  playGl.clear();

  const program = playGl.createProgram();

  playGl.use(program);

  playGl.addMeshData({
    positions: [[1, 1, 0], [1, -1, 0], [-1, -1, 0], [-1, 1, 0]],
    textureCoord: [[1, 1], [1, 0], [0, 0], [0, 1]],
    cells: [[0, 1, 2], [2, 3, 0]]
    // attributes: {
    //   color: [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]]
    // }
  })

  // const wallTexture = await playGl.loadTexture('./example/common/img/snowPhoto.hdr');
  const wallTexture = await playGl.loadTexture('./example/common/img/box.jpg');
  console.log(wallTexture);
  playGl.setUniform('wall', wallTexture);

})()

// let time = 0;

// function changeColor() {
//   time++;
//   playGl.setUniform('color', [Math.sin(time / 10), Math.sin(time / 100), 0]);
//   requestAnimationFrame(changeColor);
// }

// changeColor();