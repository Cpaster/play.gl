import { pointsToBuffer, createProgram, loadImage } from './utils/helper';
import DEFAULT_VERTEX from './defaultVertexShader.glsl';
import DEFAULT_FRAGMENT from './defaultFragmentShader.glsl';


const uniformTypeMap = {
  int: '1i',
  ivec2: '2i',
  ivec3: '3i',
  ivec4: '4i',
  float: '1f',
  vec2: '2f',
  vec3: '3f',
  vec4: '4f',
  mat2: 'Matrix2fv',
  mat3: 'Matrix3fv',
  mat4: 'Matrix4fv',
  sampler1D: 'sampler1D',
  sampler2D: 'sampler2D',
  sampler3D: 'sampler3D',
  samplerCube: 'samplerCube',
  sampler1DShadow: 'sampler1DShadow',
  sampler2DShadow: 'sampler2DShadow',
  sampler2DRect: 'sampler2DRect',
  sampler2DRectShadow: 'sampler2DRectShadow',
};

export default class PlayGL {
  canvas: HTMLCanvasElement;
  options: PlayGLOption;
  gl: WebGLRenderingContext;
  meshDatas: Array<MeshData>;
  program: PlayGlProgram;
  _max_texture_image_units: number;

  static defaultOptions = {
    preserveDrawingBuffer: true,
    vertexPositionName: 'a_vertexPosition',
    vertexTextuseCoordsName: 'a_textureCoord'
  };
  
  constructor(canvas, options?: PlayGLOption) {
    let gl: WebGLRenderingContext;
    this.canvas = canvas;
    this.meshDatas = [];
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

  createProgram(fragmentCode:string = DEFAULT_FRAGMENT, vertexCode: string = DEFAULT_VERTEX) {
    const { gl } = this;

    const program = createProgram(gl, vertexCode, fragmentCode);
    this.program = program;

    this.program._buffers = {};
    this.program._attribute = {};

    const pattern = new RegExp(`(?:attribute|in) vec(\\d) ${this.options.vertexPositionName}`, 'im');
    let matched = vertexCode.match(pattern);
    if(matched) {
      this.program._dimension = Number(matched[1]);
    }

    const vTexCoord = gl.getAttribLocation(program, this.options.vertexTextuseCoordsName);
    if (vTexCoord > -1) {
      this.program._buffers.textCoordBuffer = gl.createBuffer();
    }

    const texCoordPattern = new RegExp(`(?:attribute|in) vec(\\d) ${this.options.vertexTextuseCoordsName}`, 'im');
    matched = vertexCode.match(texCoordPattern);
    if(matched) {
      this.program._texCoordSize = Number(matched[1]);
    }

    const attributePattern = /^\s*(?:attribute|in) (\w+?)(\d*) (\w+)/gim;
    matched = vertexCode.match(attributePattern);
    
    if(matched) {
      for (let i = 0; i < matched?.length; i++) {
        const patt = /^\s*(?:attribute|in) (\w+?)(\d*) (\w+)/im;
        const _matched = matched[i].match(patt);
        if (_matched && ![this.options.vertexPositionName, this.options.vertexTextuseCoordsName].includes(_matched[3])) {
          let [, type, size, name] = _matched;
          this.program._buffers[name] = gl.createBuffer();
          this.program._attribute[name] = {
            size: type === 'mat' ? Number(size || 1) ** 2 : Number(size || 1),
            name,
            type: type as ('mat' | 'vec')
          }
        }
      }
    }

    const uniformPattern = /^\s*uniform\s+(\w+)\s+(\w+)(\[\d+\])?/mg;
    matched = vertexCode.match(uniformPattern) || [];
    matched = matched.concat(fragmentCode.match(uniformPattern) || []);
      /** 
       * about uniform type
       * https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL2RenderingContext/uniform
       * https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL2RenderingContext/uniformMatrix
      **/
    this.program._uniform = {};
    this.program._samplerMap = {};
    this.program._bindTextures = [];
    matched?.forEach((m): void => {
      const _matched = m.match(/^\s*uniform\s+(\w+)\s+(\w+)(\[\d+\])?/);
      let [type, name, isVector] = _matched.splice(1);
      type = uniformTypeMap[type];
      if (type.indexOf('Matrix') > -1 && isVector) {
        type += 'v';
      }
      this.program._uniform[name] = {
        type
      }
    })

    this.program._buffers.vertexBuffer = gl.createBuffer();
    this.program._buffers.cellBuffer = gl.createBuffer();

    return program;
  }

  // uniform[1234](u?i|f)v?
  // uniformMatrix[234]x[234]fv()
  setUniform(name: string, v) {
    const {gl, program} = this;
    let value: Array<number> = Array.isArray(v) ? v : [v];
    const uniformInfo = program._uniform[name];
    if (uniformInfo) {
      const uniformLocation = gl.getUniformLocation(program, name);
      const { type } = uniformInfo;
      if (/^sampler/.test(type)) {
        const idx = program._samplerMap[name] ? program._samplerMap[name] : program._bindTextures?.length;
        program._bindTextures[idx] = v;
        gl.activeTexture(gl.TEXTURE0 + idx);
        gl.bindTexture(gl.TEXTURE_2D, v);
        if (!program._samplerMap[name]) {
          program._samplerMap[name] = idx;
          gl.uniform1i(uniformLocation, idx);
          uniformInfo.value = idx;
        }
      } else {
        const setUniform = gl[`uniform${type}`].bind(gl);
        const isMatrix = type.indexOf('Matrix') > -1;
        const isVector = !isMatrix && /v$/.test(type);
        if (isMatrix) {
          setUniform(uniformLocation, false, value);
        } else if (isVector) {
          setUniform(uniformLocation, value);
        } else {
          setUniform(uniformLocation, ...value);
        }
      }
      uniformInfo.value = value;
      this.render();
    } else {
      console.warn(`${name} isn’t exist in uniform`);
    }
  }

  getUniform(name: string) {
    return this.program._uniform[name].value || '';
  }

  async loadTexture(src: string) {
    const texture = await loadImage(src);
    return this.createTexture(texture);
  }

  createTexture(img) {
    const {gl} = this;
    this._max_texture_image_units = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    gl.activeTexture(gl.TEXTURE0 + this._max_texture_image_units - 1);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    if (img) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    }

    // TODO 将其修改为可配置的选项
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  }
  
  use(program: PlayGlProgram) {
    const { gl, options } = this;
    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, program._buffers.vertexBuffer);
    const vPosition = gl.getAttribLocation(program, options.vertexPositionName);
    gl.vertexAttribPointer(vPosition, program._dimension, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    if (program._buffers.textCoordBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, program._buffers.textCoordBuffer);
      const location = gl.getAttribLocation(program, options.vertexTextuseCoordsName);
      gl.vertexAttribPointer(location, program._texCoordSize, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(location);
    }

    Object.entries(program._attribute).forEach(([key, value]): void => {
      const {size, name} = value;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.program._buffers[name]);
      const location = gl.getAttribLocation(program, name);
      if (location > -1) {
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(location);
      }
    })
  }

  addMeshData(data: createMeshDataParam) {
    const meshData: MeshData = {};
    if (!data) {
      throw new Error('mesh data should`t empty');
    }
    const {positions, cells, uniforms, attributes, textureCoord } = data;
    const positionFloatArray = pointsToBuffer(positions, Float32Array);
    
    meshData.position = positionFloatArray;
    
    if (uniforms) {
      meshData.uniforms = uniforms; // TODO修改其最终的样式
    }

    if (cells) {
      meshData.cells = pointsToBuffer(cells, Uint16Array);
      meshData.cellCount = meshData.cells?.length || 0;
    }

    if (attributes) {
      meshData.attributes = {};
      Object.entries(attributes).forEach(([key, value]) => {
        if (this.program._attribute[key]) {
          const {size} = this.program._attribute[key];
          if (value[0]?.length !== size) {
            throw new Error(`the attribute '${key}' in shader size is ${size}, but input is ${value[0]?.length}`);
          }
          meshData.attributes[key] = {
            name: key,
            size: value[0]?.length,
            data: pointsToBuffer(value || [], Float32Array)
          }
        } else {
          console.warn(`the ${key} don't exist in shader !`);
        }
      })
    }

    if (textureCoord) {
      meshData.textureCoord = {
        size: textureCoord[0]?.length || 0,
        data: pointsToBuffer(textureCoord || [], Float32Array)
      };
    }
    this.meshDatas.push(meshData);
  }

  _draw() {
    const {gl, program} = this;
    this.meshDatas.forEach(meshData => {
      const {position, cells, cellCount, attributes, textureCoord } = meshData;

      gl.bindBuffer(gl.ARRAY_BUFFER, program._buffers.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

      if (cells) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program._buffers.cellBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW);
      }

      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          const {data, name} = value;
          gl.bindBuffer(gl.ARRAY_BUFFER, program._buffers[name]);
          gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        })
      }

      if (this.program._buffers.textCoordBuffer && textureCoord) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.program._buffers.textCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, textureCoord?.data, gl.STATIC_DRAW);
      }

      if (cells) {
        gl.drawElements(gl.TRIANGLES, cellCount, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.drawArrays(gl.TRIANGLES, 0, position.length / program._dimension);
      }
    })
  }

  render() {
    const {gl, options} = this;
    const { depth, stencil } = options;

    if (depth) {
      gl.enable(gl.DEPTH_TEST);
    }

    gl.clear(
      gl.COLOR_BUFFER_BIT
      | (depth ? this.gl.DEPTH_BUFFER_BIT : 0)
      | (stencil ? this.gl.STENCIL_BUFFER_BIT : 0)
    );

    this._draw();
  }
}