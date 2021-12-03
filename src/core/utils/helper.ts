export const pointsToBuffer = (points: Array<Array<number>>, Type) => {
  Type = Type ? Type : Float32Array;
  if (!points?.length) {
    throw new Error('points is empty');
  }
  if (points instanceof Type) {
    return points;
  }
  const deminsion = points[0]?.length;
  const len = points?.length;
  const buffer = new Type(deminsion * len);
  let idx: number = 0;
  for(let i = 0; i < len; i++) {
    for (let j = 0; j < deminsion; j++) {
      buffer[idx++] = points[i][j];
    }
  }
  return buffer;
}

export const createProgram = (gl: WebGLRenderingContext, vertexCode: string, fragmentCode: string): WebGLProgram => {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexCode);
  gl.compileShader(vertexShader);

    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      const msg = `Vertex shader failed to compile.  The error log is:${gl.getShaderInfoLog(vertexShader)}`;
      throw new Error(msg);
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentCode);
    gl.compileShader(fragmentShader);
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      const msg = `Fragment shader failed to compile. The error log is ${gl.getShaderInfoLog(fragmentShader)}`;
      throw new Error(msg);
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const msg = `Shader program failed to link.  The error log is:${gl.getProgramInfoLog(program)}`;
      throw new Error(msg);
    }
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return program;
}