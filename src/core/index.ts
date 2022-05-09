import { pointsToBuffer, createProgram, loadImage, arrayToBuffer, isType, getHDR, getProto } from './utils/helper';
import DEFAULT_VERTEX from './defaultVertexShader.glsl';
import DEFAULT_FRAGMENT from './defaultFragmentShader.glsl';

const uniformTypeMap = {
  bool: '1i',
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

const attachmentMap = {
  color: {
    format: 'RGBA',
    internalFormat: 'RGBA',
    attachment: 'COLOR_ATTACHMENT0',
    dataType: 'UNSIGNED_BYTE',
  },
  depth: {
    internalFormat: 'DEPTH_COMPONENT',
    format: 'DEPTH_COMPONENT',
    attachment: 'DEPTH_ATTACHMENT',
    dataType: 'UNSIGNED_INT',
  }
}

const textureFormatMap = {
  'RG': {
    format: 'RG',
    internalFormat: 'RG8'
  },
  'RGB': {
    format: 'RGB',
    internalFormat: 'RGB8'
  },
  'RGBA': {
    format: 'RGBA',
    internalFormat: 'RGBA32F',
  }
}

export default class PlayGL {
  canvas: HTMLCanvasElement;
  mod: number;
  options: PlayGLOption;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  _max_texture_image_units: number;
  frameBuffer: PlayGLFrameBuffer;
  programs: PlayGlProgram[] = [];
  _bindTexturesLen: number = 1;
  _textureActionIdMaps: Record<string, string> = {};
  // cubeFrameBuffers: PlayGLFrameBuffer[];
  blockUniforms: Record<
    string,
    {
      buffer: WebGLBuffer;
      index?: number;
      programs: Array<{
        program: WebGLProgram;
        uniformBlockId: number
      }>;
      bufferSize?: number;
      elm?: Record<string, {
        offset: number;
        baseSize: number;
      }>
    }
  > = {};

  get program(): PlayGlProgram {
    const gl = this.gl;
    return gl.getParameter(gl.CURRENT_PROGRAM);
  }

  get glContext() {
    return this.gl;
  }

  static defaultOptions = {
    preserveDrawingBuffer: true,
    depth: true,
    stencil: true,
    antialias: false,
    autoUpdate: false,
    vertexPositionName: 'a_vertexPosition',
    vertexTextuseCoordsName: 'a_textureCoord'
  };
  
  constructor(canvas, options?: PlayGLOption) {
    let gl: WebGLRenderingContext | WebGL2RenderingContext;
    this.canvas = canvas;

    this.options = Object.assign({}, PlayGL.defaultOptions, options || {});
    if (this.options.isWebGL2) {
      gl = canvas.getContext('webgl2', this.options);
    } else {
      gl = canvas.getContext('webgl', this.options);
    }
    this.gl = gl;
    this.mod = gl.TRIANGLES;

    const {depth, stencil} = this.options;
    if (depth) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
    }
    if (stencil) {
      gl.enable(gl.STENCIL_TEST);
    }
    
    // gl.getExtension('WEBGL_compressed_texture_astc');
    gl.getExtension('WEBGL_depth_texture');
    gl.getExtension('EXT_frag_depth');
    gl.getExtension('OES_texture_float');
    // gl.getExtension('EXT_shader_io_blocks');
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // 面剔除
    // gl.frontFace(gl.CW);
  }

  clear(clearOpt?: {
    color?: Array<number>;
    width?: number;
    height?: number;
  }) {
    const {color = [], width: optWidth, height: optHeight} = clearOpt || {};
    const { gl, options } = this;
    //FRAMEBUFFER_SRGB
    const {width, height} = this.canvas;
    const {depth, stencil} = options;

    gl.viewport(0, 0, optWidth || width, optHeight || height );
    gl.clearColor(color[0] || 0.0, color[1] ||0.0, color[2] || 0.0, color[3] || 0.0);
    gl.clear(
      gl.COLOR_BUFFER_BIT
      | (depth ? this.gl.DEPTH_BUFFER_BIT : 0)
      | (stencil ? this.gl.STENCIL_BUFFER_BIT : 0)
    );
  }

  setTransformFeedbackVarying(program, transform_feedback_varyings) {
    const { gl , options} = this;
    const { isWebGL2 } = options;
    if (!isWebGL2) {
      return ;
    }
    if (transform_feedback_varyings != null) {
      (gl as WebGL2RenderingContext).transformFeedbackVaryings(
        program, transform_feedback_varyings, (gl as WebGL2RenderingContext).INTERLEAVED_ATTRIBS
      );
    }
  }

  createProgram(
    fragmentCode:string = DEFAULT_FRAGMENT, 
    vertexCode: string = DEFAULT_VERTEX,
    options?: {
      transform_feedback_varyings?: String[];
      setAttributeBuffer?: boolean;
    }
  ) {
    const {setAttributeBuffer = true, transform_feedback_varyings} = options || {};
    const { gl } = this;

    const program: PlayGlProgram = createProgram(gl, vertexCode, fragmentCode, transform_feedback_varyings);

    program._buffers = {};
    program._attribute = {};
    program.meshDatas = [];
    program._uniform = {};
    program._samplerMap = {};
    program._bindTextures = [];

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
    if (matched) {
      program._texCoordSize = Number(matched[1]);
    }

    if (setAttributeBuffer) {
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
              size: Number(size || 1),
              name,
              type: type as ('mat' | 'vec')
            }
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
    });

    const uniformBlockPattern = /^layout\s*\(std140\)\s*uniform\s+(\w+)\s*\n*\s*{\s*\n*\s*((((\w)\s*\[*\]*)+);\s*\n*\s*)+\s*\n*\s*}/mg;
    matched = vertexCode.match(uniformBlockPattern);

    if (this.options.isWebGL2) {
      let gl = this.gl as WebGL2RenderingContext;
      matched?.forEach(m => {
        const _matchedName = m.match(/\s*uniform\s+(\w+)/);
        const uniformName = _matchedName && _matchedName[1];
        const uniformBlockId = gl.getUniformBlockIndex(program, uniformName);
        if (!this.blockUniforms[uniformName]) {
          const blockUniformBuffer = gl.createBuffer();
          this.blockUniforms[uniformName] = {
            buffer: blockUniformBuffer,
            programs: [{
              program,
              uniformBlockId
            }]
          };
          const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
          const indices = [...Array(numUniforms).keys()];
          const blockIndices = gl.getActiveUniforms(program, indices, gl.UNIFORM_BLOCK_INDEX);
          const offsets = gl.getActiveUniforms(program, indices, gl.UNIFORM_OFFSET);
          const blockElms = {};
          let maxBufferLen = 0;
          for (let ii = 0; ii < numUniforms; ++ii) {
            const uniformInfo = gl.getActiveUniform(program, ii);
            if (uniformInfo?.name.startsWith("gl_") || uniformInfo?.name.startsWith("webgl_")) {
                continue;
            }
            const {name, type} = uniformInfo;
            const blockIndex = blockIndices[ii];
            const offset = offsets[ii];
            if (offset >= 0 && blockIndex === uniformBlockId) {
              maxBufferLen = Math.max(maxBufferLen, offset);
              blockElms[name] = {
                type,
                offset,
              }
            }
          }
          this.blockUniforms[uniformName].elm = blockElms;
          this.blockUniforms[uniformName].bufferSize = maxBufferLen + 64;
        } else {
          // TODO
          this.blockUniforms[uniformName].programs.push({
            program,
            uniformBlockId
          });
        }
      });
    }

    program._buffers.vertexBuffer = gl.createBuffer();
    program._buffers.cellBuffer = gl.createBuffer();

    this.programs.push(program);
    return program;
  }

  createBlockUniform() {
    const {options, blockUniforms } = this;
    const {isWebGL2} = options;
    if (!isWebGL2) {
      console.warn('not webgl2 context, so can`t use this function');
      return;
    }
    const gl = this.gl as WebGL2RenderingContext;

    Object.entries(blockUniforms).forEach(([key, value], index) => {
      const {buffer, bufferSize, programs } = value;
      programs.forEach((p) => {
        const {program, uniformBlockId} = p;
        gl.uniformBlockBinding(program, uniformBlockId, index);
      });

      gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
      gl.bufferData(gl.UNIFORM_BUFFER, bufferSize * 4, gl.STATIC_DRAW);

      gl.bindBufferRange(gl.UNIFORM_BUFFER, index, buffer, 0, bufferSize * 4);
      blockUniforms[key].index = index;
    });
  }

  setBlockUniformValue(name: string, uniforms: Record<string, any>) {
    const {blockUniforms, options} = this;
    const blockUniform = blockUniforms[name];
    const {isWebGL2} = options;
    if (!isWebGL2) {
      console.warn('not webgl2 context, so can`t use this function');
      return;
    }
    
    const gl = this.gl as WebGL2RenderingContext;

    if (blockUniform) {
      const {elm, buffer} = blockUniform;
      gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
      Object.entries(uniforms).forEach(([key, value]) => {
        const elmVal = elm[key];
        if (elmVal) {
          const { offset } = elmVal;
          gl.bufferSubData(gl.UNIFORM_BUFFER, offset, arrayToBuffer(value));
        }
      });
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    } else {
      console.warn(`${name} isn\`t exist`);
    }
  }

  _setUniform(name, type, v) {
    const {program, gl} = this;
    const uniformInfo = program._uniform[name];
    const uniformLocation = gl.getUniformLocation(program, name);

    if (/^sampler/.test(type)) {
      const targetType = type === 'samplerCube' ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D;
      const idx = this._bindTexturesLen;
      if (!this._textureActionIdMaps[name]) {
        this._textureActionIdMaps[name] = `${idx}`;
        gl.activeTexture(gl.TEXTURE0 + idx);
        this._bindTexturesLen = this._bindTexturesLen + 1;
      } else {
        gl.activeTexture(gl.TEXTURE0 + Number(this._textureActionIdMaps[name]));
      }
      gl.bindTexture(targetType, v);
      if (!program._samplerMap[name]) {
        program._samplerMap[name] = idx;
        gl.uniform1i(uniformLocation, idx);
        uniformInfo.value = idx;
      }
    } else {
      let value: Array<number> = (
        Array.isArray(v) || isType('Float32Array', v) || isType('Float16Array', v)
      ) ? v : [v];

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

    Object.entries(program?._uniform).forEach(([key, typeValue]) => {
      const { type } = typeValue;
      if (key === name) {
        this._setUniform(name, type, v);
      } else if (new RegExp(`^${key}$`).test(name)) {
        this._setUniform(name, type, v);
      } else if (name.indexOf(key) > -1) {
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

  async loadTexture(src: string | string[] | HTMLCanvasElement, options?:TextureParams) {
    const {gl} = this;
    if (src) {
      options = {
        wrapS: 'CLAMP_TO_EDGE',
        wrapT: 'CLAMP_TO_EDGE',
        minFilter: 'LINEAR',
        magFilter: 'LINEAR',
        ...options
      };
      let textures;
      if (getProto(src, 'HTMLCANVASELEMENT')) {
        textures = [src];
      } else {
        textures = await Promise.all(
          ((typeof src === 'string' ? [src] : src) as string[])?.map((s: string) => {
            if (s.match(/.hdr$/)) {
              return getHDR(s, {
                responseType: 'arraybuffer'
              });
            } else {
              return loadImage(s, options.isFlipY)
            }
          })
        );
      }
      if (textures.length) {
        const textureType = textures.length > 1 ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D;
        return this.createTexture(
          textureType,
          textures,
          options
        );
      }
    }
    return null;
  }

  createTexture(textureType, img, options: TextureParams) {
    const {gl} = this;
    const isCubeTexture = textureType === gl.TEXTURE_CUBE_MAP;
    this._max_texture_image_units = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    gl.activeTexture(gl.TEXTURE0 + this._max_texture_image_units - 1);

    const texture = gl.createTexture();
    gl.bindTexture(textureType, texture);

    if (options.isFlipY !== false) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    }

    // gl.generateMipmap(gl.TEXTURE_2D);

    if (isCubeTexture) {
      for (let i = 0; i < img?.length; i++) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[i]);
      }
    } else {
      if (img?.[0]?.isHDR) {
        // hdr texture
        if (this.options.isWebGL2) {
          gl.texImage2D(gl.TEXTURE_2D, 0, (gl as WebGL2RenderingContext).RGBA16F, img[0].width, img[0].height, 0, gl.RGBA, gl.FLOAT, img[0].pixels);
        } else {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, img[0].width, img[0].height, 0, gl.RGBA, gl.FLOAT, img[0].pixels);
        }
      } else if (options.format) {
        const textureForamt = textureFormatMap[options.format];
        const { width, height, pixels } = img[0];
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl[textureForamt?.internalFormat],
          width,
          height,
          0,
          gl[textureForamt?.format],
          gl[options?.type || 'UNSIGNED_BYTE'],
          pixels
        );
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[0]);
      }
    }

    gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, this.gl[options.wrapS]);
    gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, this.gl[options.wrapT]);

    gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, this.gl[options.minFilter]);
    gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, this.gl[options.magFilter]);
    gl.bindTexture(textureType, null);

    return texture;
  }
  
  use(program: PlayGlProgram) {
    const { gl, options } = this;
    
    gl.useProgram(program);
    if (program?._buffers?.vertexBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, program._buffers.vertexBuffer);
    }
    const vPosition = gl.getAttribLocation(program, options.vertexPositionName);
    if (vPosition > -1) {
      gl.vertexAttribPointer(vPosition, program._dimension, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vPosition);
    }

    if (program?._buffers?.textCoordBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, program._buffers.textCoordBuffer);
      const location = gl.getAttribLocation(program, options.vertexTextuseCoordsName);
      if (location > -1) {
        gl.vertexAttribPointer(location, program._texCoordSize, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(location);
      }
    }

    Object.entries(program?._attribute || {}).forEach(([key, value]): void => {
      const {size, name, type} = value;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.program._buffers[name]);
      const location = gl.getAttribLocation(program, name);
      if (location > -1) {
        if (type === 'mat') {
          for (let i = 0; i < size; i++) {
            gl.enableVertexAttribArray(location + i);
            gl.vertexAttribPointer(location + i, size, gl.FLOAT, false, 4 * (size ** 2), i * (size ** 2));
          }
        } else {
          gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(location);
        }
      }
    })
  }

  createBuffer(data) {
    const { gl } = this;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    return buffer;
  }

  addBufferVAO(buffers) {
    const { gl, program } = this;
    const vao = (gl as WebGL2RenderingContext).createVertexArray();
    (gl as WebGL2RenderingContext).bindVertexArray(vao);
    buffers.forEach(b => {
      const { buffer, attribs, typeSize } = b;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      let offset = 0;
      for (let attrib_name in attribs) {
        if (attribs.hasOwnProperty(attrib_name)) {
          let attrib = attribs[attrib_name];
          const location = gl.getAttribLocation(program, attrib_name);
          gl.enableVertexAttribArray(location);
          gl.vertexAttribPointer(
            location,
            attrib?.dimension,
            gl[attrib?.type],
            false,
            attrib?.stride,
            offset
          );
          offset += attrib?.dimension * typeSize;
  
          if (attrib.hasOwnProperty('divisor')) {
            (gl as WebGL2RenderingContext).vertexAttribDivisor(location, attrib?.divisor);
          }
        }
      }
    });
    (gl as WebGL2RenderingContext).bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return vao;
  }

  addMeshData(data: createMeshDataParam) {
    const {program} = this;
    const meshData: MeshData = {};
    if (!data) {
      throw new Error('mesh data should`t empty');
    }
    const {positions, cells, uniforms = {}, attributes, textureCoord, useBlend, useCullFace, instanceCount, mod } = data;
    const positionFloatArray = pointsToBuffer(positions, Float32Array);
    meshData.instanceCount = instanceCount || 0;
    meshData.position = positionFloatArray;
    meshData.useBlend = useBlend || false;
    meshData.useCullFace = useCullFace || false;
    meshData.mod = mod || this.gl.TRIANGLES;
    
    if (uniforms) {
      meshData.uniforms = uniforms; // TODO修改其最终的样式
    }

    if (cells) {
      if ((typeof cells[0]) === 'number') {
        meshData.cells = arrayToBuffer(
          (cells as number[]),
          Uint16Array
        );
      } else {
        meshData.cells = pointsToBuffer(
          cells as Array<Array<number>>, 
          Uint16Array
        );
      }
      meshData.cellCount = meshData.cells?.length || 0;
    }

    if (attributes) {
      meshData.attributes = {};
      Object.entries(attributes).forEach(([key, value]) => {
        const { data, divisor } = value;
        if (this.program?._attribute[key]) {
          const {type} = this.program._attribute[key];
          meshData.attributes[key] = {
            name: key,
            divisor,
            type,
            size: data[0]?.length || 1,
            count: data?.length || 0,
            data: typeof data[0] === 'number' ? 
            arrayToBuffer((data as unknown as number[]), Float32Array) : 
              pointsToBuffer(data || [], Float32Array)
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
      Object.entries(program?._uniform).forEach(([key]) => {
        if (name === key || new RegExp(`^${key}$`).test(name)) {
          meshData.uniforms[name] = val;
        }
      })
    };

    this.program.meshDatas.push(meshData);
    return meshData;
  }

  createTextureCubeFrameBuffer(fbOpt?: {
    width?: number;
    height?: number;
    closeRenderBuffer?: boolean;
  }) {
    let { width, height, closeRenderBuffer = false } = fbOpt || {};
    const {gl, canvas} = this;
    width = width || canvas.width;
    height = height || canvas.height;

    const textureBuffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureBuffer);
    // gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    for (let i = 0; i < 6; i++) {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, textureBuffer, 0);
    }

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const frameBuffer: PlayGLFrameBuffer = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    let depthBuffer = gl.createRenderbuffer();
    if (!closeRenderBuffer) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    frameBuffer.renderBuffer = depthBuffer;
    frameBuffer.texture = textureBuffer;
    frameBuffer.isCubeBox = true;
    frameBuffer.faceId = 0;
    
    return frameBuffer;
  }

  createFrameBuffer(type = 'color', fbOpt: {
    width?: number;
    height?: number;
  } = {}) {
    let {width, height} = fbOpt;
    const {gl, options, canvas} = this;
    const {depth, stencil, samples} = options;
    width = width || canvas.width;
    height = height || canvas.height;

    const frameBuffer: PlayGLFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    const attachment = attachmentMap[type];
    if (samples) {
      const colorFrameBuffer = gl.createFramebuffer();
      const colorRenderBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, colorRenderBuffer);
      (gl as WebGL2RenderingContext).renderbufferStorageMultisample(gl.RENDERBUFFER, samples, (gl as WebGL2RenderingContext).RGBA8, width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorRenderBuffer);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      frameBuffer.colorFrame = colorFrameBuffer;
      gl.bindFramebuffer(gl.FRAMEBUFFER, colorFrameBuffer);
    }

    const textureBuffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl[attachment.internalFormat], width, height, 0, gl[attachment.format], gl[attachment.dataType], null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl[attachment.attachment],  gl.TEXTURE_2D, textureBuffer, 0);
    if (type === 'depth') {
      const unusedTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, unusedTexture, 0); 
    }
    frameBuffer.texture = textureBuffer;
    
    if (type === 'color' && depth && stencil) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
      const rbo = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
      if (samples) {
        (gl as WebGL2RenderingContext).renderbufferStorageMultisample(gl.RENDERBUFFER, samples, (gl as WebGL2RenderingContext).DEPTH24_STENCIL8, width, height);
      } else {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
      }
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rbo);
      frameBuffer.renderBuffer = rbo;
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
    const {gl, program, mod: defaultMod} = this;
    program.meshDatas.forEach(meshData => {
      const {
        position, cells, cellCount, attributes, textureCoord, uniforms, useBlend, instanceCount, mod = defaultMod 
      } = meshData;
      if (useBlend) {
        gl.enable(gl.BLEND);
      } else {
        gl.disable(gl.BLEND);
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
      const locations = [];
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          const {data, name, divisor, type, size} = value;
          gl.bindBuffer(gl.ARRAY_BUFFER, program._buffers[name]);
          gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
          if (divisor !== undefined) {
            const location = gl.getAttribLocation(program, name);
            if(location > -1) {
              gl.enableVertexAttribArray(location);
              if (this.options.isWebGL2) {
                if (type === 'mat') {
                  for (let i = 0; i < Math.sqrt(size); i++) {
                    locations.push(location + i);
                    (gl as WebGL2RenderingContext).vertexAttribDivisor(location + i, divisor);
                  }
                } else {
                  locations.push(location);
                  (gl as WebGL2RenderingContext).vertexAttribDivisor(location, divisor);
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
              }
            }
          }
        })
      }

      if (this.program._buffers.textCoordBuffer && textureCoord) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.program._buffers.textCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, textureCoord?.data, gl.STATIC_DRAW);
      }
      if (!!instanceCount) {
        if (cells) {
          (gl as WebGL2RenderingContext).drawElementsInstanced(mod, cellCount, gl.UNSIGNED_SHORT, 0, instanceCount);
        } else {
          (gl as WebGL2RenderingContext).drawArraysInstanced(mod, 0, position.length / program._dimension, instanceCount);
        }
        locations.forEach((location) => {
          (gl as WebGL2RenderingContext).vertexAttribDivisor(location, null);
        });
      } else {
        if (cells) {
          gl.drawElements(mod, cellCount, gl.UNSIGNED_SHORT, 0);
        } else {
          gl.drawArrays(mod, 0, position.length / program._dimension);
        }
      }
    })
  }

  draw(mod = this.gl.TRIANGLES) {
    this.mod = mod;
    this.render({
      noClear: true
    });
  }

  render(params: {
    noClear?: boolean;
    mipLevel?: number;
  } = {}) {
    const { noClear = false, mipLevel = 0 } = params;
    const {gl, options, canvas} = this;
    const { samples } = options;
    const {width, height} = canvas;
    if (this.frameBuffer) {
      if (samples) {
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        // gl.clearColor(0.1, 0.1, 0.1, 1.0);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // gl.enable(gl.DEPTH_TEST);
        gl.bindFramebuffer((gl as WebGL2RenderingContext).READ_FRAMEBUFFER, this.frameBuffer);
        gl.bindFramebuffer((gl as WebGL2RenderingContext).DRAW_FRAMEBUFFER, this.frameBuffer.colorFrame);
        // (gl as WebGL2RenderingContext).clearBufferfv((gl as WebGL2RenderingContext).COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
        (gl as WebGL2RenderingContext).blitFramebuffer(0, 0, width, height, 0, 0, width, height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        if (this.frameBuffer.isCubeBox && this.frameBuffer.faceId < 6) {
          const {texture, faceId} = this.frameBuffer;
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,  gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceId, texture, mipLevel || 0);
          this.frameBuffer.faceId = faceId + 1;
        }
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
          console.error('framebuffer create fail');
        }
      }
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
