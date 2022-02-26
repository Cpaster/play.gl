interface CubeParams {
  xSize: number;
  ySize: number;
  zSize: number;
}

function createCube(params?: CubeParams) {
  const  {xSize = 1, ySize = 1, zSize = 1} = params || {};
  const xS = xSize / 2;
  const yS = ySize / 2;
  const zS = zSize / 2;

  let position = [
    // back
    [-xS, -yS, -zS], [xS, yS, -zS], [xS, -yS, zS], [xS, yS, -zS], [-xS, -yS,-zS], [-xS, yS, -zS],
    // front
    [-xS, -yS, zS], [xS, -yS, zS], [xS, yS, zS], [xS, yS, zS], [-xS, yS, zS], [-xS, -yS, zS],
    // left
    [-xS, yS, zS], [-xS, yS, -zS], [-xS, -yS, -zS], [-xS, -yS, -zS], [-xS, -yS, zS], [-xS, yS, zS],
    // right
    [xS, yS, zS], [xS, -yS, -zS], [xS, yS, -zS], [xS, -yS, -zS], [xS, yS, zS], [xS, -yS, zS],
    // bottom
    [-xS, -yS, -zS], [xS, -yS, -zS], [xS, -yS, zS], [xS, -yS, zS], [-xS, -yS, zS], [-xS, -yS, -zS],
    // top
    [-xS, yS, -zS], [xS, yS, zS], [xS, yS, -zS], [xS, yS, zS], [-xS, yS, -zS], [-xS, yS, zS]
  ];

  let uv = [
    // back
    [0, 0], [1, 1], [1, 0], [1, 1], [0, 0], [0, 1],
    // front
    [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0],
    // left
    [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 0],
    // right
    [1, 0], [0, 1], [1, 1], [0, 1], [1, 0], [0, 0],
    // bottom
    [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
    // top
    [0, 1], [1, 0], [1, 1], [1, 0], [0, 1], [0, 0]
  ];
  let normals = [
    // back
    [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1],
    // front
    [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],
    // left
    [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
    // right
    [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
    // bottom
    [0, -1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0],
    // top
    [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]
  ];  

  return {
    position,
    textureCoord: uv,
    aNormal: normals,
    cells: null,
    mod: 'TRIANGLE'
  }
}

export default createCube;