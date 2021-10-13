import { mat4, vec3 } from "gl-matrix";

export default class Camera {
  private position = vec3.create();
  private rotation = vec3.create();
  // private viewMatrix = mat4.create();

  private fov: number;
  private near: number;
  private far: number;
  private aspect: number;
  private projectionMatrix = mat4.create();

  constructor(gl: WebGL2RenderingContext, fov: number = Math.PI / 3, near: number = 0, far: number = 1000) {
    this.setProjectionMatrix(gl, fov, near, far);
  }

  setProjectionMatrix(
    gl: WebGL2RenderingContext,
    fov: number = Math.PI / 3,
    near: number = 0.1,
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

  moveForward(dist: number) {
    const rotation = mat4.create();
    mat4.fromXRotation(rotation, this.rotation[0]);
    mat4.rotateY(rotation, rotation, this.rotation[1]);

    const translation = vec3.fromValues(0, 0, -dist);
    vec3.transformMat4(translation, translation, rotation);

    vec3.add(this.position, this.position, translation);
    // mat4.translate(this.viewMatrix, this.viewMatrix, translation);
  }

  moveRight(dist: number) {
    const rotation = mat4.create();
    mat4.fromZRotation(rotation, this.rotation[2]);
    mat4.rotateY(rotation, rotation, this.rotation[1]);

    const translation = vec3.fromValues(dist, 0, 0);
    vec3.transformMat4(translation, translation, rotation);

    vec3.add(this.position, this.position, translation);
    // mat4.translate(this.viewMatrix, this.viewMatrix, translation);
  }

  rotateX(angle: number) {
    this.rotation[0] += angle;
    // mat4.rotateX(this.viewMatrix, this.viewMatrix, angle);
  }

  rotateY(angle: number) {
    this.rotation[1] += angle;
    // mat4.rotateY(this.viewMatrix, this.viewMatrix, angle);
  }

  rotateZ(angle: number) {
    this.rotation[2] += angle;
    // mat4.rotateZ(this.viewMatrix, this.viewMatrix, angle);
  }

  getViewMatrix() {
    const vMatrix = mat4.create();
    mat4.translate(vMatrix, vMatrix, this.position);
    mat4.rotateX(vMatrix, vMatrix, this.rotation[0]);
    mat4.rotateY(vMatrix, vMatrix, this.rotation[1]);
    mat4.rotateZ(vMatrix, vMatrix, this.rotation[2]);

    return mat4.invert(vMatrix, vMatrix);
  }
}
