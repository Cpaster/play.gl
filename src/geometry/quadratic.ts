interface QuadParams {
  width: number;
  height: number;
}

function createQuad(params?: QuadParams) {
  const  { width = 1, height = 1 } = params || {};
  const x = width / 2;
  const y = height / 2;
  let position = [
    [-x, y, 0],
    [-x, -y, 0],
    [x, y, 0],
    [x, -y, 0]
  ];

  let uv = [
    [0, 1],
    [0, 0],
    [1, 1],
    [1, 0]
  ];

  let normals = [
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1]
  ];

  return {
    position,
    textureCoord: uv,
    aNormal: normals,
    cells: null,
    mod: 'TRIANGLE'
  }
}

export default createQuad;