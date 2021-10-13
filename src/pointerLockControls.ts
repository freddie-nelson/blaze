import { glMatrix, mat3, mat4, quat, quat2, vec3 } from "gl-matrix";
import Camera from "./camera";
import Object3D from "./object3d";
import Player from "./player";

export default class PointerLockControls {
  private element: HTMLElement;
  sensitivity: number;
  isLocked = false;
  movementX = 0;
  movementY = 0;

  yaw = -90;
  pitch = 0;
  direction = vec3.create();

  object: Object3D;
  camera: Camera;

  constructor(element: HTMLElement, camera: Camera, object?: Object3D, sensitivity: number = 0.1) {
    this.element = element;
    this.camera = camera;
    this.object = object;
    this.sensitivity = sensitivity;

    element.addEventListener("click", () => {
      if (!this.isLocked) element.requestPointerLock();
    });

    document.addEventListener("pointerlockchange", () => {
      this.isLocked = !this.isLocked;

      if (!this.isLocked) {
        this.movementX = 0;
        this.movementY = 0;
      }
    });

    element.addEventListener("mousemove", (e) => {
      if (this.isLocked) {
        this.movementX = e.movementX;
        this.movementY = e.movementY;
      }
    });
  }

  update() {
    if (!this.isLocked) return;

    this.yaw += this.movementX * this.sensitivity;
    this.pitch -= this.movementY * this.sensitivity;

    // cap pitch
    if (this.pitch > 89) this.pitch = 89;
    else if (this.pitch < -89) this.pitch = -89;

    this.direction[0] = Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
    this.direction[1] = Math.sin(glMatrix.toRadian(this.pitch));
    this.direction[2] = Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));

    this.camera.direction = this.direction;

    if (this.object) {
      const objectRotation = ((this.yaw + 90) % 360) * -1;
      this.object.setRotationY(glMatrix.toRadian(objectRotation));
    }

    this.movementX = 0;
    this.movementY = 0;
  }
}
