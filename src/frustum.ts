import { mat4, vec3 } from "gl-matrix";
import Camera from "./camera";
import Box from "./physics/box";
import Plane from "./physics/plane";

/**
 * Enum for a {@link Frustum}'s planes array.
 */
enum Planes {
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
  NEAR,
  FAR,
}

/**
 * Represents a camera's frustum.
 *
 * Can be used to perform frustum culling, among other things.
 */
export default class Frustum {
  aspect: number;
  fov: number;
  nearDist: number;
  farDist: number;
  nearHeight: number;
  nearWidth: number;
  farHeight: number;
  farWidth: number;
  farCenter: vec3;

  planes: Plane[] = [new Plane(), new Plane(), new Plane(), new Plane(), new Plane(), new Plane()];

  /**
   * Creates a {@link Frustum} instance.
   */
  constructor() {}

  /**
   * Sets the new dimensions to use when calculating the frustum's planes.
   *
   * @param fov The new fov to use for frustum calculations (in radians)
   * @param near The new near distance to use for frustum calculations
   * @param far The new far distance to use for frustum calculations
   * @param aspect The new aspect ratio to use for frustum calculations
   */
  resize(fov: number, near: number, far: number, aspect: number) {
    this.fov = fov;
    this.nearDist = near;
    this.farDist = far;
    this.aspect = aspect;

    const tang = Math.tan(fov / 2);
    this.nearHeight = tang * near;
    this.nearWidth = this.nearHeight * aspect;

    this.farHeight = tang * far;
    this.farWidth = this.farHeight * aspect;
  }

  /**
   * Calculates the provided {@link Camera}'s frustum and updates the stored frustum.
   *
   * All of the frustum's plane's normals point towards the inside of the frustum.
   *
   * For more info on how the frustum is calculated see [here](http://www.lighthouse3d.com/tutorials/view-frustum-culling/geometric-approach-implementation/)
   *
   * @param camera The camera to calculate a frustum for
   */
  update(camera: Camera) {
    const p = camera.getPosition();

    // calculate point camera is looking at
    const direction = camera.direction;
    const l = vec3.create();
    vec3.add(l, p, direction);

    const up = vec3.fromValues(0, 1, 0);

    const X = vec3.create();
    const Y = vec3.create();
    const Z = vec3.create();

    vec3.sub(Z, p, l);
    vec3.normalize(Z, Z);

    vec3.cross(X, up, Z);
    vec3.normalize(X, X);

    vec3.cross(Y, Z, X);

    const fc = vec3.create();
    vec3.scale(fc, Z, this.farDist);
    vec3.sub(fc, p, fc);
    const nc = vec3.create();
    vec3.scale(nc, Z, this.nearDist);
    vec3.sub(nc, p, nc);

    const fUp = vec3.create();
    vec3.scale(fUp, Y, this.farHeight);
    const fRight = vec3.create();
    vec3.scale(fRight, X, this.farWidth);
    const nUp = vec3.create();
    vec3.scale(nUp, Y, this.nearHeight);
    const nRight = vec3.create();
    vec3.scale(nRight, X, this.nearWidth);

    const ftl = vec3.create();
    vec3.add(ftl, fc, fUp);
    vec3.sub(ftl, ftl, fRight);
    const ftr = vec3.create();
    vec3.add(ftr, fc, fUp);
    vec3.add(ftr, ftr, fRight);
    const fbl = vec3.create();
    vec3.sub(fbl, fc, fUp);
    vec3.sub(fbl, fbl, fRight);
    const fbr = vec3.create();
    vec3.sub(fbr, fc, fUp);
    vec3.add(fbr, fbr, fRight);

    const ntl = vec3.create();
    vec3.add(ntl, nc, nUp);
    vec3.sub(ntl, ntl, nRight);
    const ntr = vec3.create();
    vec3.add(ntr, nc, nUp);
    vec3.add(ntr, ntr, nRight);
    const nbl = vec3.create();
    vec3.sub(nbl, nc, nUp);
    vec3.sub(nbl, nbl, nRight);
    const nbr = vec3.create();
    vec3.sub(nbr, nc, nUp);
    vec3.add(nbr, nbr, nRight);

    this.planes[Planes.TOP].set3Points(ntr, ntl, ftl);
    this.planes[Planes.BOTTOM].set3Points(nbl, nbr, fbr);
    this.planes[Planes.LEFT].set3Points(ntl, nbl, fbl);
    this.planes[Planes.RIGHT].set3Points(nbr, ntr, fbr);
    this.planes[Planes.NEAR].set3Points(ntl, ntr, nbr);
    this.planes[Planes.FAR].set3Points(ftr, ftl, fbl);
  }

  /**
   * Determines wether the provided box is inside the frustum.
   *
   * This is true when at least on of the box's vertices are on the positive halfside of all of the frustum's planes.
   *
   * @param box The box to check against the frustum's planes
   * @returns Wether or not the box is inside the frustum
   */
  containsBox(box: Box) {
    const points = box.getPoints();
    let result = true;
    for (const pl of this.planes) {
      const corners = { in: 0, out: 0 };
      for (let i = 0; i < points.length && (corners.in === 0 || corners.out === 0); i++) {
        if (pl.distToPoint(points[i]) < 0) {
          corners.out++;
        } else {
          corners.in++;
        }
      }

      if (corners.in === 0) {
        return false;
      } else if (corners.out > 0) {
        result = true;
      }
    }

    return result;
  }
}
