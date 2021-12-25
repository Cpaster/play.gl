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
  _max_texture_image_units: number;
  frameBuffer: PlayGLFrameBuffer;

  get program(): PlayGlProgram {
    const gl = this.gl;
    return gl.getParameter(gl.CURRENT_PROGRAM);
  }

  static defaultOptions = {
    preserveDrawingBuffer: true,
    depth: true,
    stencil: true,
    autoUpdate: false,
    vertexPositionName: 'a_vertexPosition',
    vertexTextuseCoordsName: 'a_textureCoord'
  };
  
  constructor(canvas, options?: PlayGLOption) {
    let gl: WebGLRenderingContext;
    this.canvas = canvas;
    this.options = Object.assign({}, PlayGL.defaultOptions, options || {});
    gl = canvas.getContext('webgl', this.options);
    this.gl = gl;

    const {depth, stencil} = this.options;
    if (depth) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
    }
    if (stencil) {
      gl.enable(gl.STENCIL_TEST);
    }
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // 面剔除
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
  }

  clear() {
    const { gl, options } = this;
    //FRAMEBUFFER_SRGB
    const {width, height} = this.canvas;
    console.log(width);
    console.log(height);
    const {depth, stencil} = options;

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(
      gl.COLOR_BUFFER_BIT
      | (depth ? this.gl.DEPTH_BUFFER_BIT : 0)
      | (stencil ? this.gl.STENCIL_BUFFER_BIT : 0)
    );
  }

  createProgram(fragmentCode:string = DEFAULT_FRAGMENT, vertexCode: string = DEFAULT_VERTEX) {
    const { gl } = this;

    const program: PlayGlProgram = createProgram(gl, vertexCode, fragmentCode);
    // this.program = program;

    program._buffers = {};
    program._attribute = {};
    program.meshDatas = [];

    const pattern = new RegExp(`(?:attribute|in) vec(\\d) ${this.options.vertexPositionName}`, 'im');
    let matched = vertexCode.match(pattern);
    if(matched) {
      program._dimension = Number(matched[1]);
    }

    const vTexCoord = gl.getAttribLocation(program, this.options.vertexTextuseCoordsName);
    if (vTexCoord > -1) {
      program._buffers.textCoordBuffer = gl.createBuffer();
    }

    const texCoordPattern = new RegExp(`(?:attribute|in) vec(\\d) ${this.options.vertexTextuseCoordsName}`, 'im');
    matched = vertexCode.match(texCoordPattern);
    if(matched) {
      program._texCoordSize = Number(matched[1]);
    }

    const attributePattern = /^\s*(?:attribute|in) (\w+?)(\d*) (\w+)/gim;
    matched = vertexCode.match(attributePattern);
    if(matched) {
      for (let i = 0; i < matched?.length; i++) {
        const patt = /^\s*(?:attribute|in) (\w+?)(\d*) (\w+)/im;
        const _matched = matched[i].match(patt);
        if (_matched && ![this.options.vertexPositionName, this.options.vertexTextuseCoordsName].includes(_matched[3])) {
          let [, type, size, name] = _matched;
          program._buffers[name] = gl.createBuffer();
          program._attribute[name] = {
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
    program._uniform = {};
    program._samplerMap = {};
    program._bindTextures = [];
    matched?.forEach((m): void => {
      const _matched = m.match(/^\s*uniform\s+(\w+)\s+(\w+)(\[\d+\])?/);
      let [type, name, isVector] = _matched.splice(1);
      if (type && !uniformTypeMap[type]) {
        // uniform为struct的结构
        const linePatt = '\\s*\\n*\\s*';
        const pattern = new RegExp(`^${linePatt}struct ${type} {${linePatt}((((\\w)\\s*\\[*\\]*)+);${linePatt})+${linePatt}}`, 'gim');
        const _m = fragmentCode.match(pattern);
        const structName = !isVector ? name : `${name}\\[(\\d)+\\]`;
        if (_m??[0]) {
          const structElementsPattern = /\s*(\w+)\s+(\w+)(\[\d+\])?;/mg;
          const structElms = _m[0]?.match(structElementsPattern);
          structElms.forEach(elm => {
            const _elm = elm.match(/^\s*(\w+)\s+(\w+)(\[\d+\])?/);
            let [elmType, subName, subIsVector] = _elm.splice(1);
            type = uniformTypeMap[elmType] || '';
            if (type.indexOf('Matrix') !== 0 && subIsVector) {
              type += 'v';
            }
            program._uniform[`${structName}.${subName}`] = {
              type
            }
          })
        }
      } else {
        type = uniformTypeMap[type] || '';
        if (type.indexOf('Matrix') !== 0 && isVector) {
          type += 'v';
        }
        program._uniform[name] = {
          type
        }
      }
    })

    program._buffers.vertexBuffer = gl.createBuffer();
    program._buffers.cellBuffer = gl.createBuffer();

    return program;
  }

  _setUniform(name, type, v) {
    const {program, gl} = this;
    const uniformInfo = program._uniform[name];
    const uniformLocation = gl.getUniformLocation(program, name);

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
      let value: Array<number> = Array.isArray(v) ? v : [v];

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
      if (uniformInfo) {
        
      }
      uniformInfo ? (uniformInfo.value = value) : 
      (program._uniform[name] = {
        type,
        value
      });
    }
  }

  // uniform[1234](u?i|f)v?
  // uniformMatrix[234]x[234]fv()
  setUniform(name: string, v) {
    const { program } = this;

    Object.entries(program._uniform).forEach(([key, typeValue]) => {
      const { type } = typeValue;
      if (key === name) {
        this._setUniform(name, type, v);
      } else if (new RegExp(`^${key}$`).test(name)) {
        this._setUniform(name, type, v);
      }
      if (this.options.autoUpdate) {
        this.render();
      }
    })
  }

  getUniform(name: string) {
    return this.program._uniform[name].value || '';
  }

  async loadTexture(src: string, options?:TextureParams) {
    options = {
      wrapS: 'CLAMP_TO_EDGE',
      wrapT: 'CLAMP_TO_EDGE',
      minFilter: 'LINEAR',
      magFilter: 'LINEAR',
      ...options
    };
    const texture = await loadImage(src);
    return this.createTexture(texture, options);
  }

  createTexture(img, options: TextureParams) {
    const {gl} = this;
    this._max_texture_image_units = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    gl.activeTexture(gl.TEXTURE0 + this._max_texture_image_units - 1);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // gl.generateMipmap(gl.TEXTURE_2D);

    if (img) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.gl[options.wrapS]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.gl[options.wrapT]);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.gl[options.minFilter]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.gl[options.magFilter]);
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
    const {program} = this;
    const meshData: MeshData = {};
    if (!data) {
      throw new Error('mesh data should`t empty');
    }
    const {positions, cells, uniforms, attributes, textureCoord, useBlend, useCullFace } = data;
    const positionFloatArray = pointsToBuffer(positions, Float32Array);
    
    meshData.position = positionFloatArray;
    meshData.useBlend = useBlend || false;
    meshData.useCullFace = useCullFace || false;
    
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

    meshData.setMeshUniform = (name: string, val) => {
      Object.entries(program._uniform).forEach(([key]) => {
        if (name === key || new RegExp(`^${key}$`).test(name)) {
          meshData.uniforms[name] = val;
        } else {
          console.warn(`${name} isn't vaild`);
        }
      })
    };

    this.program.meshDatas.push(meshData);
    return meshData;
  }

  createFrameBuffer() {
    const {gl, options, canvas} = this;
    const {depth, stencil} = options;
    const {width, height} = canvas;
    const frameBuffer: PlayGLFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    const textureBuffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,  gl.TEXTURE_2D, textureBuffer, 0);
    frameBuffer.texture = textureBuffer;
    
    if (depth && stencil) {
      const rbo = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rbo);
    }

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('framebuffer create fail');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return frameBuffer;
  }

  bindFBO(frameBuffer) {
    this.frameBuffer = frameBuffer;
  }

  setDefaultFBO() {
    const { gl } = this;
    this.frameBuffer = null;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  _draw() {
    const {gl, program} = this;

    this.program.meshDatas.forEach(meshData => {
      const {position, cells, cellCount, attributes, textureCoord, uniforms, useBlend, useCullFace } = meshData;
      if (useBlend) {
        gl.enable(gl.BLEND);
      } else {
        gl.disable(gl.BLEND);
      }
      if (useCullFace) {
        gl.enable(gl.CULL_FACE);
      } else {
        gl.disable(gl.CULL_FACE);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, program._buffers.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

      if (cells) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program._buffers.cellBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW);
      }

      if(uniforms) {
        Object.entries(uniforms).forEach(([key, value]) => {
          this.setUniform(key, value);
        });
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

  draw() {
    this.render(true);
  }

  render(noClear?: boolean) {
    const {gl} = this;
    if (this.frameBuffer) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    }

    if (!noClear) {
      this.clear();
    }

    this._draw();

    if (this.frameBuffer) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  }
}
