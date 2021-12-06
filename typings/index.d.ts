declare module "*.glsl";

interface PlayGLOption extends WebGLContextAttributes {
  depth?: boolean;
  stencil?: boolean;
  vertexPositionName?: string;
  vertexTextuseCoordsName?: string;
}

interface PlayGlProgram extends WebGLProgram {
  _buffers?: Record<string, WebGLBuffer>;
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
  cells?: Array<Array<number>>;
  attributes?: Record<string, Array<number[]>>;
  uniforms?: Record<string, any>; // TODO 后续修改相关的配置
  textureCoord?: Array<number[]>
}

interface MeshData {
  position?: Float32Array;
  cells?: Float32Array;
  cellCount?: number;
  attributes?: Record<string, { 
    data: Float32Array;
    size: number;
    name: string; 
  }>;
  uniforms?: Record<string, any>; // TODO 后续修改相关的配置
  textureCoord?: {
    data: Float32Array;
    size: number;
  };
}