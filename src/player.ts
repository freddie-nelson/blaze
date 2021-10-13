import { vec3 } from "gl-matrix";
import Camera from "./camera";
import { isKeyPressed } from "./keyboard";
import Object3D from "./object3d";
import PointerLockControls from "./pointerLockControls";

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
  direction = vec3.fromValues(0, 0, -1);

  plControls: PointerLockControls;

  constructor(gl: WebGL2RenderingContext) {
    super();

    this.camera = new Camera(gl);
    this.camera.setPosition(this.cameraPos);

    this.plControls = new PointerLockControls(<HTMLElement>gl.canvas, this.camera, this);
  }

  update(delta: number) {
    // update rotation
    this.plControls.update();

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

    let acceleration = this.acceleration;
    let maxVelocity = vec3.clone(this.maxVelocity);

    // sprint
    if (isKeyPressed("ShiftLeft")) {
      acceleration *= 1.2;
      vec3.multiply(maxVelocity, maxVelocity, vec3.fromValues(1.5, 1, 1.5));
    }

    if (isKeyPressed("KeyW")) {
      hasMoved.f = true;
      this.velocity[2] += acceleration * delta;
      if (Math.abs(this.velocity[2]) > maxVelocity[2])
        this.velocity[2] = maxVelocity[2] * Math.sign(this.velocity[2]);
    }
    if (isKeyPressed("KeyS")) {
      hasMoved.b = true;
      this.velocity[2] -= acceleration * delta;
      if (Math.abs(this.velocity[2]) > maxVelocity[2])
        this.velocity[2] = maxVelocity[2] * Math.sign(this.velocity[2]);
    }
    if (isKeyPressed("KeyA")) {
      hasMoved.l = true;
      this.velocity[0] -= acceleration * delta;
      if (Math.abs(this.velocity[0]) > maxVelocity[0])
        this.velocity[0] = maxVelocity[0] * Math.sign(this.velocity[0]);
    }
    if (isKeyPressed("KeyD")) {
      hasMoved.r = true;
      this.velocity[0] += acceleration * delta;
      if (Math.abs(this.velocity[0]) > maxVelocity[0])
        this.velocity[0] = maxVelocity[0] * Math.sign(this.velocity[0]);
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
    this.moveForward(this.velocity[2] * delta);
    this.moveRight(this.velocity[0] * delta);

    const position = vec3.create();
    vec3.add(position, this.getPosition(), this.cameraPos);
    this.camera.setPosition(position);
  }
}
