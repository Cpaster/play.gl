
interface PlayGLOption extends WebGLContextAttributes {
  test?: number;
}

export default class PlayGL {
  canvas: HTMLCanvasElement;
  options: PlayGLOption;
  gl: WebGLRenderingContext;
  static defaultOptions = {
    preserveDrawingBuffer: true,
  };
  constructor(canvas, options?: PlayGLOption) {
    let gl: WebGLRenderingContext;
    this.canvas = canvas;
    this.options = Object.assign({}, PlayGL.defaultOptions, options || {});
    gl = canvas.getContext('webgl', this.options);
    this.gl = gl;
  }

  clear() {
    const { gl } = this;
    const {width, height} = this.canvas;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
  }

  createProgram(fragment:string, vertex:string) {
    const { gl } = this;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertex);
    gl.compileShader(vertexShader);

    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      const msg = `Vertex shader failed to compile.  The error log is:${gl.getShaderInfoLog(vertexShader)}`;
      throw new Error(msg);
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragment);
    
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
  
  use(program) {
    const { gl } = this;

    gl.useProgram(program);
    
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    const vPosition = gl.getAttribLocation(program, 'position');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
  }
}