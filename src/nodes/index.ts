import { create, multiply, copy } from "../math/mat4";

class Node {
  public name;
  private _source;
  private _children;
  private _parent;
  private _localMatrix;
  public worldMatrix;
  // public meshDatas;
  constructor(source, name) {
    this.name = name;
    this._source = source;
    this._parent = null;
    this._children = [];
    this._localMatrix = create();
    this.worldMatrix = create();
    // this.meshDatas = [];
  }
  setParent(parent) {
    if (this._parent) {
      this._parent._removeChild(this);
      this._parent = null;
    }
    if (parent) {
      parent._addChild(this);
      this._parent = parent;
    }
  }
  updateWorldMatrix(parentWorldMatrix) {
    const source = this._source;
    if (source) {
      source.getMatrix(this._localMatrix);
    }

    if (parentWorldMatrix) {
      // a matrix was passed in so do the math
      // m4.multiply(parentWorldMatrix, this._localMatrix, this._worldMatrix);
      multiply(this.worldMatrix, this._localMatrix, parentWorldMatrix);
    } else {
      // no matrix was passed in so just copy local to world
      copy(this.worldMatrix, this._localMatrix);
    }

    // now process all the children
    const worldMatrix = this.worldMatrix;
    for (const child of this._children) {
      child.updateWorldMatrix(worldMatrix);
    }
  }

  traverse(fn) {
    fn(this);
    for (const child of this._children) {
      child.traverse(fn);
    }
  }
  _addChild(child) {
    this._children.push(child);
  }
  _removeChild(child) {
    const ndx = this._children.indexOf(child);
    this._children.splice(ndx, 1);
  }
}

export default Node;
