import { glMatrix, mat4, vec3 } from "gl-matrix";
import Frustum from "./frustum";
import Object3D from "./object3d";

export default class Camera extends Object3D {
  private fov: number;
  private near: number;
  private far: number;
  private aspect: number;
  private projectionMatrix = mat4.create();

  up = vec3.fromValues(0, 1, 0);
  direction = vec3.fromValues(0, 0, -1);

  lastDirection = vec3.create();
  lastPosition = vec3.create();

  frustum: Frustum;

  constructor(gl: WebGL2RenderingContext, fov?: number, near?: number, far?: number) {
    super();

    this.frustum = new Frustum();
    this.setProjectionMatrix(gl, fov, near, far);
    // this.frustum.update(this);
  }

  /**
   * Sets the fov of the camera.
   *
   * @param fov FOV angle of the camera in degrees
   */
  setFov(gl: WebGL2RenderingContext, fov: number) {
    this.setProjectionMatrix(gl, glMatrix.toRadian(fov));
  }

  setProjectionMatrix(
    gl: WebGL2RenderingContext,
    fov: number = (70 * Math.PI) / 180,
    near: number = 0.1,
    far: number = 2000
  ) {
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.aspect = gl.canvas.width / gl.canvas.height;

    this.frustum.resize(this.fov, near, far, this.aspect);

    mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
    this.frustum.update(this);
  }

  getProjectionMatrix() {
    return this.projectionMatrix;
  }

  getViewMatrix() {
    const vMatrix = mat4.create();
    mat4.translate(vMatrix, vMatrix, this.getPosition());

    const target = vec3.create();
    vec3.add(target, this.getPosition(), this.direction);
    mat4.targetTo(vMatrix, this.getPosition(), target, this.up);

    return mat4.invert(vMatrix, vMatrix);
  }

  getProjectionViewMatrix() {
    return mat4.multiply(mat4.create(), this.projectionMatrix, this.getViewMatrix());
  }

  update() {
    // console.log(
    //   !vec3.equals(this.getPosition(), this.lastPosition) || !vec3.equals(this.direction, this.lastDirection)
    // );
    if (
      !vec3.exactEquals(this.getPosition(), this.lastPosition) ||
      !vec3.exactEquals(this.direction, this.lastDirection)
    )
      this.frustum.update(this);

    vec3.copy(this.lastDirection, this.direction);
    vec3.copy(this.lastPosition, this.getPosition());
  }
}
