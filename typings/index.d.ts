declare module "*.glsl";

interface PlayGLOption extends WebGLContextAttributes {
  isWebGL2?: boolean;
  depth?: boolean;
  stencil?: boolean;
  samples?: number;
  vertexPositionName?: string;
  vertexTextuseCoordsName?: string;
  autoUpdate?: boolean;
}

interface PlayGlProgram extends WebGLProgram {
  _buffers?: Record<string, WebGLBuffer>;
  meshDatas?: Array<MeshData>;
  _attribute?: Record<string, {
    size: number;
    name: string;
    type: 'mat' | 'vec';
  }>
  _uniform?: Record<string, {type: string, value?: number | Array<number> | Float32Array}>;
  _dimension?: number;
  _texCoordSize?: number;
  _bindTextures?: Array<any>;
  _samplerMap?: Record<string, number>;
}

interface createMeshDataParam {
  positions: Array<Array<number>>;
  instanceCount?: number;
  cells?: Array<Array<number>>;
  attributes?: Record<string, {
    data: Array<number[]>;
    divisor?: 0 | 1 | 2;
  }>;
  uniforms?: Record<string, any>; // TODO 后续修改相关的配置
  textureCoord?: Array<number[]>
  useBlend?: boolean;
  useCullFace?: boolean;
}

interface MeshData {
  instanceCount?: number;
  position?: Float32Array;
  cells?: Float32Array;
  cellCount?: number;
  attributes?: Record<string, { 
    data: Float32Array;
    size: number;
    name: string; 
    count: number;
    divisor?: 0 | 1 | 2;
    type: 'mat' | 'vec';
  }>;
  uniforms?: Record<string, any>; // TODO 后续修改相关的配置
  textureCoord?: {
    data: Float32Array;
    size: number;
  };
  useBlend?: boolean;
  useCullFace?: boolean;
  setMeshUniform?: (name: string, value) => void;
}

interface TextureParams {
  wrapS?: 'REPEAT' | 'MIRRORED_REPEAT' | 'CLAMP_TO_EDGE' | 'CLAMP_TO_BORDER';
  wrapT?: 'REPEAT' | 'MIRRORED_REPEAT' | 'CLAMP_TO_EDGE' | 'CLAMP_TO_BORDER'
  minFilter?: 'NEAREST' | 'LINEAR' | 'LINEAR_MIPMAP_LINEAR' | 'NEAREST_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR';
  magFilter?: 'NEAREST' | 'LINEAR' | 'LINEAR_MIPMAP_LINEAR' | 'NEAREST_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR';
  isFlipY?: boolean;
}

interface PlayGLFrameBuffer extends WebGLFramebuffer {
  texture?: WebGLTexture;
  colorFrame?: WebGLFramebuffer;
}