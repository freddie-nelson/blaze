import { mat4, vec3 } from "gl-matrix";

export default class Camera {
  private position = vec3.create();
  private rotation = vec3.create();
  private viewMatrix = mat4.create();

  private fov: number;
  private near: number;
  private far: number;
  private aspect: number;
  private projectionMatrix = mat4.create();

  constructor(gl: WebGL2RenderingContext, fov: number = 60, near: number = 0, far: number = 1000) {
    this.setProjectionMatrix(gl, fov, near, far);
  }

  setProjectionMatrix(gl: WebGL2RenderingContext, fov: number = 60, near: number = 0.1, far: number = 1000) {
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.aspect = gl.canvas.width / gl.canvas.height;

    mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
  }

  getProjectionMatrix() {
    return this.projectionMatrix;
  }

  moveForward(dist: number) {
    this.position[2] += dist;
    mat4.translate(this.viewMatrix, this.viewMatrix, [0, 0, dist]);
  }

  moveRight(dist: number) {
    this.position[0] += dist;
    mat4.translate(this.viewMatrix, this.viewMatrix, [dist, 0, 0]);
  }

  rotateX(angle: number) {
    this.rotation[0] += angle;
    mat4.rotateX(this.viewMatrix, this.viewMatrix, angle);
  }

  rotateY(angle: number) {
    this.rotation[1] += angle;
    mat4.rotateY(this.viewMatrix, this.viewMatrix, angle);
  }

  rotateZ(angle: number) {
    this.rotation[2] += angle;
    mat4.rotateZ(this.viewMatrix, this.viewMatrix, angle);
  }

  getViewMatrix() {
    return this.viewMatrix;
  }
}
