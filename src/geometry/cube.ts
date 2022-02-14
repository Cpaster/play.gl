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
    [-xS, -yS, -zS], [xS, -yS, -zS], [xS, yS, -zS], [xS, yS, -zS], [-xS, yS,-zS], [-xS, -yS, -zS],
    [-xS, -yS, zS], [xS, -yS, zS], [xS, yS, zS], [xS, yS, zS], [-xS, yS, zS], [-xS, -yS, zS],
    [-xS, yS, zS], [-xS, yS, -zS], [-xS, -yS, -zS], [-xS, -yS, -zS], [-xS, -yS, zS], [-xS, yS, zS],
    [xS, yS, zS], [xS, yS, -zS], [xS, -yS, -zS], [xS, -yS, -zS], [xS, -yS, zS], [xS, yS, zS],
    [-xS, -yS, -zS], [xS, -yS, -zS], [xS, -yS, zS], [xS, -yS, zS], [-xS, -yS, zS], [-xS, -yS, -zS],
    [-xS, yS, -zS], [xS, yS, -zS], [xS, yS, zS], [xS, yS, zS], [-xS, yS, zS], [-xS, yS, -zS]
  ];

  let uv = [
    [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0],
    [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0],
    [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 0],
    [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [1, 0],
    [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1],
    [0, 1], [1, 1], [1, 0], [1, 0], [0, 0], [0, 1]
  ];
  let normals = [
    [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1],
    [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],
    [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
    [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
    [0, -1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0], [0 ,-1, 0],
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