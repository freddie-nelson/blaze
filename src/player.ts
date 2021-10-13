import { vec3 } from "gl-matrix";
import Camera from "./camera";
import { isKeyPressed } from "./keyboard";
import Object3D from "./object3d";

export default class Player extends Object3D {
  height = 1.8;
  width = 0.8;

  walkForce = 5;
  jumpForce = 6.8;
  acceleration = 80;

  friction = 25;
  weight = 20;

  velocity = vec3.fromValues(0, 0, 0);
  maxVelocity = vec3.fromValues(5, 20, 5);

  camera: Camera;
  cameraPos = vec3.fromValues(this.width / 2, this.height / 4, this.width / 2);

  constructor(camera: Camera) {
    super();

    this.camera = camera;
    camera.setPosition(this.cameraPos[0], this.cameraPos[1], this.cameraPos[2]);
  }

  update(delta: number) {
    // player movement
    const hasMoved = this.calcNewVelocity(delta);
    this.applyFriction(delta, hasMoved);

    // update position
    this.calcNewPosition(delta);
  }

  private calcNewVelocity(delta: number) {
    const hasMoved = {
      l: false,
      r: false,
      f: false,
      b: false,
    };

    if (isKeyPressed("KeyW")) {
      hasMoved.f = true;
      this.velocity[2] += this.acceleration * delta;
      if (Math.abs(this.velocity[2]) > this.maxVelocity[2])
        this.velocity[2] = this.maxVelocity[2] * Math.sign(this.velocity[2]);
    }
    if (isKeyPressed("KeyS")) {
      hasMoved.b = true;
      this.velocity[2] -= this.acceleration * delta;
      if (Math.abs(this.velocity[2]) > this.maxVelocity[2])
        this.velocity[2] = this.maxVelocity[2] * Math.sign(this.velocity[2]);
    }
    if (isKeyPressed("KeyA")) {
      hasMoved.l = true;
      this.velocity[0] -= this.acceleration * delta;
      if (Math.abs(this.velocity[0]) > this.maxVelocity[0])
        this.velocity[0] = this.maxVelocity[0] * Math.sign(this.velocity[0]);
    }
    if (isKeyPressed("KeyD")) {
      hasMoved.r = true;
      this.velocity[0] += this.acceleration * delta;
      if (Math.abs(this.velocity[0]) > this.maxVelocity[0])
        this.velocity[0] = this.maxVelocity[0] * Math.sign(this.velocity[0]);
    }

    return hasMoved;
  }

  private applyFriction(delta: number, hasMoved: { l: boolean; r: boolean; f: boolean; b: boolean }) {
    const friction = this.friction;
    const sign = {
      x: Math.sign(this.velocity[0]),
      y: Math.sign(this.velocity[1]),
      z: Math.sign(this.velocity[2]),
    };

    if (!hasMoved.l && !hasMoved.r) {
      this.velocity[0] -= sign.x * friction * delta;
      if (Math.sign(this.velocity[0]) !== sign.x) this.velocity[0] = 0;
    }
    if (!hasMoved.f && !hasMoved.b) {
      this.velocity[2] -= sign.z * friction * delta;
      if (Math.sign(this.velocity[2]) !== sign.z) this.velocity[2] = 0;
    }
  }

  private calcNewPosition(delta: number) {
    const rotation = this.getRotation();
    this.camera.setRotation(rotation[0], rotation[1], rotation[2]);

    this.moveForward(this.velocity[2] * delta);
    this.moveRight(this.velocity[0] * delta);

    this.camera.moveForward(this.velocity[2] * delta);
    this.camera.moveRight(this.velocity[0] * delta);
  }
}
