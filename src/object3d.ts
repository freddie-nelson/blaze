import { mat4, vec3 } from "gl-matrix";

/**
 * A generic interface to represent any 3D object's neighbours in a grid.
 */
export interface Neighbours<T> {
  [index: string]: T;
  left?: T;
  right?: T;
  bottom?: T;
  top?: T;
  front?: T;
  back?: T;
  fl?: T;
  fr?: T;
  bl?: T;
  br?: T;
}

/**
 * Represents an object in 3D space with a position and rotation
 */
export default class Object3D {
  private position = vec3.create();
  private rotation = vec3.create();

  constructor() {}

  /**
   * Sets the object's position.
   *
   * @param pos The object's new position
   */
  setPosition(pos: vec3) {
    this.position = pos;
  }

  /**
   * Sets the x component of the object's position.
   *
   * @param pos The object's new x coordinate
   */
  setPositionX(pos: number) {
    this.position[0] = pos;
  }

  /**
   * Sets the y component of the object's position.
   *
   * @param pos The object's new y coordinate
   */
  setPositionY(pos: number) {
    this.position[1] = pos;
  }

  /**
   * Sets the z component of the object's position.
   *
   * @param pos The object's new z coordinate
   */
  setPositionZ(pos: number) {
    this.position[2] = pos;
  }

  /**
   * Gets the object's position.
   *
   * @returns The object's position as a vec3
   */
  getPosition() {
    return this.position;
  }

  /**
   * Moves the object's position forward relative to it's rotation.
   *
   * @param dist The distance to move forward, can be + or -
   */
  moveForward(dist: number) {
    const rotation = mat4.create();
    mat4.fromXRotation(rotation, this.rotation[0]);
    mat4.rotateY(rotation, rotation, this.rotation[1]);

    const translation = vec3.fromValues(0, 0, -dist);
    vec3.transformMat4(translation, translation, rotation);

    vec3.add(this.position, this.position, translation);
  }

  /**
   * Moves the object's position right relative to it's rotation.
   *
   * @param dist The distance to move right, can be + or -
   */
  moveRight(dist: number) {
    const rotation = mat4.create();
    mat4.fromZRotation(rotation, this.rotation[2]);
    mat4.rotateY(rotation, rotation, this.rotation[1]);

    const translation = vec3.fromValues(dist, 0, 0);
    vec3.transformMat4(translation, translation, rotation);

    vec3.add(this.position, this.position, translation);
  }

  /**
   * Sets the object's rotation.
   *
   * @param rot The object's new rotation
   */
  setRotation(rot: vec3) {
    this.rotation = rot;
  }

  /**
   * Sets the x component of the object's rotation.
   *
   * @param rad The object's new rotation on the x axis.
   */
  setRotationX(rad: number) {
    this.rotation[0] = rad;
  }

  /**
   * Sets the y component of the object's rotation.
   *
   * @param rad The object's new rotation on the y axis.
   */
  setRotationY(rad: number) {
    this.rotation[1] = rad;
  }

  /**
   * Sets the z component of the object's rotation.
   *
   * @param rad The object's new rotation on the z axis.
   */
  setRotationZ(rad: number) {
    this.rotation[2] = rad;
  }

  /**
   * Gets the object's rotation.
   *
   * @returns The object's rotation as a vec3
   */
  getRotation() {
    return this.rotation;
  }

  /**
   * Increments the x component of the object's rotation by an angle in radians.
   *
   * @param angle The angle to rotate by in radians
   */
  rotateX(angle: number) {
    this.rotation[0] += angle;
  }

  /**
   * Increments the y component of the object's rotation by an angle in radians.
   *
   * @param angle The angle to rotate by in radians
   */
  rotateY(angle: number) {
    this.rotation[1] += angle;
  }

  /**
   * Increments the z component of the object's rotation by an angle in radians.
   *
   * @param angle The angle to rotate by in radians
   */
  rotateZ(angle: number) {
    this.rotation[2] += angle;
  }
}
