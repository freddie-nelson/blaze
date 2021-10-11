export function BLZ_CreateRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("Your browser does not support WebGL 2.0");

  BLZ_ResizeRendererToDisplay(gl);

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return gl;
}

export function BLZ_ResizeRendererToDisplay(gl: WebGL2RenderingContext) {
  gl.canvas.width = window.innerWidth;
  gl.canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}
