import { mat4, vec3 } from "gl-matrix";
import Object3D from "./object3d";

export default class Camera extends Object3D {
  private fov: number;
  private near: number;
  private far: number;
  private aspect: number;
  private projectionMatrix = mat4.create();

  up = vec3.fromValues(0, 1, 0);
  direction = vec3.fromValues(0, 0, -1);

  constructor(
    gl: WebGL2RenderingContext,
    fov: number = Math.PI / 3,
    near: number = 0.01,
    far: number = 1000
  ) {
    super();

    this.setProjectionMatrix(gl, fov, near, far);
  }

  setProjectionMatrix(
    gl: WebGL2RenderingContext,
    fov: number = Math.PI / 3,
    near: number = 0.01,
    far: number = 1000
  ) {
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.aspect = gl.canvas.width / gl.canvas.height;

    mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
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
}
