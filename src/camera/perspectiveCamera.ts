import * as mat4 from '../math/mat4';

export class PerspectiveCamera {
  private _position: [number, number, number];
  private _up: [number, number, number];
  private _fov: number;
  private _aspect: number;
  private _far: number;
  private _near: number;
  private _lookAt: [number, number, number];
  projectionMatrix: Array<number>  = [];
  viewMatrix: Array<number> = [];
  constructor(fov: number, aspect: number, near: number, far: number) {
    this._position = [0, 0, 0];
    this._up = [0, 1, 0];
    this._lookAt = [0, 0, 0];
    this._fov = fov;
    this._aspect = aspect;
    this._far = far || 1000;
    this._near = near || 0.1;
    this.updateCamera();
  }

  position(param: {
    x?: number;
    y?: number;
    z?: number;
  }) {
    const {x = 0, y = 0, z = 0} = param;
    this._position = [x, y, z];
  }

  lookAt(param: {
    x?: number;
    y?: number;
    z?: number;
  }) {
    const {x = 0, y = 0, z = 0} = param;
    this._lookAt = [x, y, z];
  }

  up(params?: {
    x: number,
    y: number,
    z: number
  }) {
    const {x = 0, y = 1, z = 0} = params;
    this._up = [x, y, z];
  }

  get cameraPosition() {
    return this._position;
  }

  updateCamera() {
    const projection = [];
    const view = [];
    mat4.perspective(projection, this._fov, this._aspect, this._near, this._far);
    mat4.lookAt(view, this._position, this._lookAt, this._up);
    this.projectionMatrix = projection;
    this.viewMatrix = view;
  }
};