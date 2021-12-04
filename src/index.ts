import PlayGL from './core';

const canvas = document.getElementById('page');
const playGl = new PlayGL(canvas);

playGl.clear();

const program = playGl.createProgram();

playGl.use(program);

playGl.addMeshData({
  positions: [[-0.5, 0.5, 0], [0.5, 0.5, 0], [0.5, -0.5, 0]],
  // attributes: {
  //   color: [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]]
  // }
})

playGl.setUniform('color', [1, 0, 1]);

playGl.render();

let time = 0;

function changeColor() {
  time++;
  playGl.setUniform('color', [Math.sin(time / 10), Math.sin(time / 100), 0]);
  requestAnimationFrame(changeColor);
}

changeColor();