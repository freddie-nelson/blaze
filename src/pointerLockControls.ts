import { glMatrix, mat3, mat4, quat, quat2, vec3 } from "gl-matrix";
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

  constructor(element: HTMLElement, sensitivity: number = 0.1) {
    this.element = element;
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

  update(player: Player) {
    if (!this.isLocked) return;

    this.yaw += this.movementX * this.sensitivity;
    this.pitch -= this.movementY * this.sensitivity;

    // cap pitch
    if (this.pitch > 89) this.pitch = 89;
    else if (this.pitch < -89) this.pitch = -89;

    this.direction[0] = Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
    this.direction[1] = Math.sin(glMatrix.toRadian(this.pitch));
    this.direction[2] = Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));

    const objectRotation = ((this.yaw + 90) % 360) * -1;
    player.setRotationY(glMatrix.toRadian(objectRotation));

    player.camera.direction = this.direction;

    this.movementX = 0;
    this.movementY = 0;
  }
}
