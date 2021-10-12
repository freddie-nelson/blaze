/**
 * Creates the webgl2 rendering context for the canvas
 * Also resizes the canvas to fit the window and clears the webgl buffer with solid black
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

  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
