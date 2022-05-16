import { compose } from '../math/mat4';

class TRS {
  private _position;
  private _rotation;
  private _scale;
  constructor(position = [0, 0, 0], rotation = [0, 0, 0, 1], scale = [1, 1, 1]) {
    this._position = position;
    this._rotation = rotation;
    this._scale = scale;
  }

  getMatrix() {
    const dst = compose(this._position, this._rotation, this._scale);
    return dst;
  }
}

export default TRS;