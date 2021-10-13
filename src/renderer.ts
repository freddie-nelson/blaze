import { clear } from "./utils/gl";

/**
 * Creates the webgl2 rendering context for the canvas
 * Also resizes the canvas to fit the window and clears the webgl buffer
 *
 * @throws When browser does not support webgl 2
 *
 * @param canvas
 * @returns Webgl 2 rendering context for **canvas**
 */
export function BLZ_CreateRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("Your browser does not support WebGL 2.0");

  BLZ_ResizeRendererToWindow(gl);
  clear(gl);

  return gl;
}

/**
 * Resizes the canvas attached to **gl** to the window size and updates the **gl** viewport
 *
 * @param gl
 */
export function BLZ_ResizeRendererToWindow(gl: WebGL2RenderingContext) {
  gl.canvas.width = window.innerWidth;
  gl.canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}
