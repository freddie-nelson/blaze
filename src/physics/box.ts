import { vec3 } from "gl-matrix";
import Plane from "./plane";

export default class Box {
  position: vec3;
  width: number;
  height: number;
  depth: number;

  constructor(position: vec3, width: number, height: number, depth: number) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.depth = depth;
  }

  getPoints() {
    const points = [];
    points.push(vec3.fromValues(this.position[0], this.position[1], this.position[2]));
    points.push(vec3.fromValues(this.position[0] + this.width, this.position[1], this.position[2]));
    points.push(vec3.fromValues(this.position[0], this.position[1], this.position[2] + this.width));
    points.push(
      vec3.fromValues(this.position[0] + this.width, this.position[1], this.position[2] + this.width)
    );
    points.push(vec3.fromValues(this.position[0], this.position[1] + this.height, this.position[2]));
    points.push(
      vec3.fromValues(this.position[0] + this.width, this.position[1] + this.height, this.position[2])
    );
    points.push(
      vec3.fromValues(this.position[0], this.position[1] + this.height, this.position[2] + this.width)
    );
    points.push(
      vec3.fromValues(
        this.position[0] + this.width,
        this.position[1] + this.height,
        this.position[2] + this.width
      )
    );

    return points;
  }

  // getVN(p: Plane) {
  //   const res = vec3.create();
  //   vec3.copy(res, this.position);

  //   if (p.a < 0) {
  //     res[0] += this.width;
  //   }
  //   if (p.b < 0) {
  //     res[1] += this.height;
  //   }
  //   if (p.c < 0) {
  //     res[2] += this.depth;
  //   }

  //   return res;
  // }

  // getVP(p: Plane) {
  //   const res = vec3.create();
  //   vec3.copy(res, this.position);

  //   if (p.a > 0) {
  //     res[0] += this.width;
  //   }
  //   if (p.b > 0) {
  //     res[1] += this.height;
  //   }
  //   if (p.c > 0) {
  //     res[2] += this.depth;
  //   }

  //   return res;
  // }
}
