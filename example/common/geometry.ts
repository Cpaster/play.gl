import PlayGL from 'core';

export const createCube = (glContext: PlayGL, size: number = 1) => {
  const cubeGeo = glContext.addMeshData({
    positions: [
      [-size, -size, -size], [size, -size, -size], [size, size, -size], [size, size, -size], [-size, size,-size], [-size, -size, -size],
      [-size, -size, size], [size, -size, size], [size, size, size], [size, size, size], [-size, size,size], [-size, -size, size],
      [-size, size, size], [-size, size, -size], [-size, -size, -size], [-size, -size, -size], [-size, -size,size], [-size, size, size],
      [size, size, size], [size, size, -size], [size, -size, -size], [size, -size, -size], [size, -size, size], [size, size, size],
      [-size, -size, -size], [size, -size, -size], [size, -size, size], [size, -size, size], [-size, -size,size], [-size, -size, -size],
      [-size, size, -size], [size, size, -size], [size, size, size], [size, size, size], [-size, size, size], [-size, size, -size]
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
  return cubeGeo;
}

export const createPlane = (glContext: PlayGL, size: number = 1) => {
  const planeGeo = glContext.addMeshData({
    positions: [
      [size, 0, size], [-size, 0,  size], [-size, 0, -size],
      [size, 0, size], [-size, 0, -size], [size, 0, -size]
    ],
    textureCoord: [
      [1, 0], [0, 0], [0, 1], [1, 0], [0, 1], [1, 1],
    ],
    attributes: {
      aNormal: {
        data: [
          [0, 1.0, 0], [0, 1.0, 0], [0, 1.0, 0],
          [0, 1.0, 0], [0, 1.0, 0], [0, 1.0, 0]
        ]
      }
    }
  });

  return planeGeo;
};