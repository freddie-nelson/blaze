import { vec3 } from "gl-matrix";
import Camera from "./camera";
import ChunkController from "./chunk/controller";
import { isKeyPressed } from "./keyboard";
import { isMouseDown, MOUSE } from "./mouse";
import Object3D from "./object3d";
import Raycaster from "./physics/raycaster/raycaster";
import PointerLockControls from "./pointerLockControls";

export default class Player extends Object3D {
  height = 1.8;
  width = 0.8;

  // movement
  walkForce = 5;
  jumpForce = 6.8;
  acceleration = 80;

  friction = 25;
  weight = 20;

  velocity = vec3.fromValues(0, 0, 0);
  maxVelocity = vec3.fromValues(5, 20, 5);

  // camera
  camera: Camera;
  cameraPos = vec3.fromValues(0, this.height, 0);
  plControls: PointerLockControls;

  // block picking
  private blockPickingChunks: ChunkController;
  private enableBlockPicking = false;
  private maxBlockPickingDist = 5;

  constructor(gl: WebGL2RenderingContext) {
    super();

    this.setPosition(vec3.fromValues(0, this.height / 2, 0));

    this.camera = new Camera(gl);
    const pos = vec3.create();
    vec3.add(pos, this.getPosition(), this.cameraPos);
    this.camera.setPosition(pos);

    this.plControls = new PointerLockControls(<HTMLElement>gl.canvas, this.camera, this);
  }

  update(delta: number) {
    // update rotation
    this.plControls.update();
    this.camera.update();

    // block picking
    if (this.enableBlockPicking) this.pickBlock();

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

  private pickBlock() {
    if (!isMouseDown(MOUSE.LEFT)) return;

    const raycaster = new Raycaster(
      this.camera.getPosition(),
      this.camera.direction,
      this.maxBlockPickingDist
    );
    const intersections = raycaster.intersectChunks(this.blockPickingChunks);
    console.log(intersections);
  }

  // toggles
  toggleBlockPicking(enable: boolean, chunkController?: ChunkController, maxBlockPickingDist = 5) {
    this.enableBlockPicking = enable;

    if (enable) {
      if (!chunkController)
        throw new Error("Player: Chunk controller must be provided when enabling block picking.");

      this.blockPickingChunks = chunkController;
      this.maxBlockPickingDist = maxBlockPickingDist;
    }
  }

  getPosition(): vec3 {
    const pos = super.getPosition();
    return vec3.fromValues(pos[0] + this.width / 2, pos[1] - this.height / 2, pos[2] + this.width / 2);
  }
}
