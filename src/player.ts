import { vec3 } from "gl-matrix";
import Camera from "./camera";
import ChunkController from "./chunk/controller";
import { isKeyPressed } from "./keyboard";
import Object3D from "./object3d";
import Raycaster from "./physics/raycaster/raycaster";
import PointerLockControls from "./pointerLockControls";
import { mergeDeep } from "./utils/objects";
import { VoxelLocation } from "./voxel";

export interface BlockIntersection {
  location: VoxelLocation;
  face: vec3;
}

export interface PlayerOptions {
  blockPicking?: {
    enable?: boolean;
    maxDist?: number;
    chunks?: ChunkController;
    cb?: (intersections?: BlockIntersection[]) => void;
  };
  movement?: {
    canMove?: boolean;
    canWalk?: boolean;
    canSprint?: boolean;
    canJump?: boolean;
    applyFriction?: boolean;
    applyGravity?: boolean;
    normalizeMovement?: boolean;
    preserveMomentumDirection?: boolean;

    walkForce?: number;
    sprintVelocityMultiplier?: number;
    jumpForce?: number;
    acceleration?: number;
    sprintAccelerationMultiplier?: number;

    friction?: number;
    weight?: number;

    maxVelocity?: vec3;
  };
}

const defaultOpts: PlayerOptions = {
  blockPicking: {
    enable: false,
    maxDist: 5,
    chunks: undefined,
    cb: undefined,
  },

  movement: {
    canMove: true,
    canWalk: true,
    canSprint: true,
    canJump: true,
    applyFriction: true,
    applyGravity: true,
    normalizeMovement: true,
    preserveMomentumDirection: false,

    walkForce: 5,
    sprintVelocityMultiplier: 1.5,
    jumpForce: 6.8,
    acceleration: 80,
    sprintAccelerationMultiplier: 1.2,

    friction: 25,
    weight: 20,

    maxVelocity: vec3.fromValues(5, 20, 5),
  },
};

export default class Player extends Object3D {
  height = 1.8;
  width = 0.8;

  // movement
  velocity = vec3.fromValues(0, 0, 0);
  lastRotation = this.getRotation();

  // camera
  camera: Camera;
  cameraPos = vec3.fromValues(0, this.height, 0);
  plControls: PointerLockControls;

  options: PlayerOptions;

  constructor(gl: WebGL2RenderingContext, opts: PlayerOptions = defaultOpts) {
    super();

    // right most value wins key collisions
    this.options = mergeDeep(defaultOpts, opts);

    this.setPosition(vec3.fromValues(0, this.height / 2, 0));

    this.camera = new Camera(gl);
    const pos = vec3.create();
    vec3.add(pos, this.getPosition(), this.cameraPos);
    this.camera.setPosition(pos);

    this.plControls = new PointerLockControls(<HTMLElement>gl.canvas, this.camera, this);
  }

  update(delta: number) {
    const opts = this.options;

    // update rotation
    this.lastRotation = vec3.clone(this.getRotation());
    this.plControls.update();

    // block picking
    if (opts.blockPicking?.enable) this.pickBlock();

    // player movement
    if (opts.movement?.canMove) {
      let hasMoved = { l: false, r: false, f: false, b: false };
      if (opts.movement?.canWalk) hasMoved = this.calcNewVelocity(delta);

      if (opts.movement?.applyFriction) this.applyFriction(delta, hasMoved);
    }

    // update camera and position
    this.camera.update();
    this.calcNewPosition(delta);
  }

  private calcNewVelocity(delta: number) {
    const opts = this.options.movement;

    const hasMoved = {
      l: false,
      r: false,
      f: false,
      b: false,
    };

    let acceleration = opts.acceleration;
    let maxVelocity = vec3.clone(opts.maxVelocity);

    // preserve momentum direction
    if (opts.preserveMomentumDirection) {
      const rotationYDiff = this.getRotation()[1] - this.lastRotation[1];
      vec3.rotateY(this.velocity, this.velocity, vec3.create(), rotationYDiff);
    }

    // sprint
    if (opts.canSprint && isKeyPressed("ShiftLeft")) {
      acceleration *= opts.sprintAccelerationMultiplier;
      vec3.multiply(
        maxVelocity,
        maxVelocity,
        vec3.fromValues(opts.sprintVelocityMultiplier, 1, opts.sprintVelocityMultiplier)
      );
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

    if (opts.normalizeMovement && (hasMoved.r || hasMoved.l) && (hasMoved.f || hasMoved.b)) {
      const scale = Math.min(vec3.len(this.velocity), Math.max(maxVelocity[0], maxVelocity[2]));
      vec3.normalize(this.velocity, this.velocity);
      vec3.scale(this.velocity, this.velocity, scale);
    }

    // apply hard velocity limit
    vec3.max(
      this.velocity,
      vec3.min(this.velocity, this.velocity, maxVelocity),
      vec3.fromValues(-maxVelocity[0], -maxVelocity[1], -maxVelocity[2])
    );
    // console.log(this.velocity);

    return hasMoved;
  }

  private applyFriction(delta: number, hasMoved: { l: boolean; r: boolean; f: boolean; b: boolean }) {
    const opts = this.options.movement;

    const friction = opts.friction;
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
    const opts = this.options.blockPicking;

    const raycaster = new Raycaster(this.camera.getPosition(), this.camera.direction, opts.maxDist);

    const intersections = raycaster.intersectChunks(opts.chunks);
    if (opts.cb) opts.cb(intersections);
  }

  enableBlockPicking(
    chunkController: ChunkController,
    maxBlockPickingDist: number,
    cb?: (intersection: BlockIntersection[]) => void
  ) {
    const opts = this.options.blockPicking;

    opts.enable = true;
    opts.chunks = chunkController;
    opts.maxDist = maxBlockPickingDist;
    opts.cb = cb;
  }

  disableBlockPicking() {
    const opts = this.options.blockPicking;

    opts.enable = false;
    opts.chunks = undefined;
  }

  getPosition(): vec3 {
    const pos = super.getPosition();
    return vec3.fromValues(pos[0] + this.width / 2, pos[1] - this.height / 2, pos[2] + this.width / 2);
  }
}
