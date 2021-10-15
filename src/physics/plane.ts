import { vec3 } from "gl-matrix";

export default class Plane {
  normal = vec3.create();
  point = vec3.create();
  d = 1;

  constructor() {}

  set3Points(v1: vec3, v2: vec3, v3: vec3) {
    const aux1 = vec3.create();
    const aux2 = vec3.create();

    vec3.sub(aux1, v2, v1);
    vec3.sub(aux2, v3, v1);

    vec3.cross(this.normal, aux1, aux2);
    vec3.normalize(this.normal, this.normal);

    vec3.copy(this.point, v1);
    this.d = -vec3.dot(this.normal, this.point);
    // console.log(this.d.toFixed(2), this.point);
  }

  distToPoint(pt: vec3) {
    return this.d + vec3.dot(this.normal, pt);
  }
}
