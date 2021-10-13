import { mat4, vec3 } from "gl-matrix";
import Object3D from "./object3d";

export default class Camera extends Object3D {
  private fov: number;
  private near: number;
  private far: number;
  private aspect: number;
  private projectionMatrix = mat4.create();

  constructor(gl: WebGL2RenderingContext, fov: number = Math.PI / 3, near: number = 0, far: number = 1000) {
    super();

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

  getViewMatrix() {
    const vMatrix = mat4.create();
    mat4.translate(vMatrix, vMatrix, this.getPosition());

    const rotation = this.getRotation();
    mat4.rotateX(vMatrix, vMatrix, rotation[0]);
    mat4.rotateY(vMatrix, vMatrix, rotation[1]);
    mat4.rotateZ(vMatrix, vMatrix, rotation[2]);

    return mat4.invert(vMatrix, vMatrix);
  }
}
