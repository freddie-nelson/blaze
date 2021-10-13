import { mat4, vec3 } from "gl-matrix";

export default class Object3D {
  private position = vec3.create();
  private rotation = vec3.create();

  constructor() {}

  setPosition(pos: vec3) {
    this.position = pos;
  }

  setPositionX(pos: number) {
    this.position[0] = pos;
  }

  setPositionY(pos: number) {
    this.position[1] = pos;
  }

  setPositionZ(pos: number) {
    this.position[2] = pos;
  }

  getPosition() {
    return this.position;
  }

  moveForward(dist: number) {
    const rotation = mat4.create();
    mat4.fromXRotation(rotation, this.rotation[0]);
    mat4.rotateY(rotation, rotation, this.rotation[1]);

    const translation = vec3.fromValues(0, 0, -dist);
    vec3.transformMat4(translation, translation, rotation);

    vec3.add(this.position, this.position, translation);
  }

  moveRight(dist: number) {
    const rotation = mat4.create();
    mat4.fromZRotation(rotation, this.rotation[2]);
    mat4.rotateY(rotation, rotation, this.rotation[1]);

    const translation = vec3.fromValues(dist, 0, 0);
    vec3.transformMat4(translation, translation, rotation);

    vec3.add(this.position, this.position, translation);
  }

  setRotation(rot: vec3) {
    this.rotation = rot;
  }

  setRotationX(rad: number) {
    this.rotation[0] = rad;
  }

  setRotationY(rad: number) {
    this.rotation[1] = rad;
  }

  setRotationZ(rad: number) {
    this.rotation[2] = rad;
  }

  getRotation() {
    return this.rotation;
  }

  rotateX(angle: number) {
    this.rotation[0] += angle;
  }

  rotateY(angle: number) {
    this.rotation[1] += angle;
  }

  rotateZ(angle: number) {
    this.rotation[2] += angle;
  }
}
