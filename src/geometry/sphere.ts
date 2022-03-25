interface SphereParams {
  xSegment: number;
  ySegment: number;
}

function createSphere(params: SphereParams) {
  let position = [];
  let uv = [];
  let normals = [];
  let cells = [];
  const {xSegment, ySegment} = params;
  for (let x = 0; x <= xSegment; ++x) {
    for (let y = 0; y <= ySegment; ++y) {
      let xs = x / xSegment;
      let ys = y / ySegment;
      
      let xPos = Math.cos(xs * 2 * Math.PI) * Math.sin(ys * Math.PI);
      let yPos = Math.cos(ys * Math.PI);
      let zPos = Math.sin(xs * 2 * Math.PI) * Math.sin(ys * Math.PI);
      position.push([xPos, yPos, zPos]);
      uv.push([xs, ys]);
      normals.push([xPos, yPos, zPos]);
    }
  }
  
  let oddRaw = false;
  for (let y = 0; y < ySegment; ++y) {
    if (!oddRaw) {
      for (let x = 0; x <= xSegment; ++x) {
        cells.push(y * (xSegment + 1) + x);
        cells.push((y + 1) * (xSegment + 1) + x);
      }
    } else {
      for (let x = xSegment; x >= 0; --x) {
        cells.push((y + 1) * (xSegment + 1) + x);
        cells.push(y * (xSegment + 1) + x);
      }
    }
    oddRaw = !oddRaw;
  }

  return {
    position,
    textureCoord: uv.reverse(),
    aNormal: normals,
    cells: cells,
    mod: 'TRIANGLE_STRIP'
  }
}

export default createSphere;