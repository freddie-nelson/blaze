import { vec3 } from "gl-matrix";

/**
 * Represents a plane in 3D space from a point on the edge of the plane, it's distance from the origin and it's normal.
 */
export default class Plane {
  normal = vec3.create();
  point = vec3.create();
  d = 0;

  /**
   * Creates a {@link Plane} instance.
   */
  constructor() {}

  /**
   * Calculate's the normal, point and distance from the origin of the plane from three points which make up the plane.
   *
   * @see [Representing A Plane](http://www.lighthouse3d.com/tutorials/maths/plane/)
   *
   * @param v1 A point on the plane
   * @param v2 A point on the plane
   * @param v3 A point on the plane
   */
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

  /**
   * Calculates the distance from the given point to the plane.
   *
   * @param pt The point to calculate the distance to
   * @returns The distance from the plane to the point
   */
  distToPoint(pt: vec3) {
    return this.d + vec3.dot(this.normal, pt);
  }
}
