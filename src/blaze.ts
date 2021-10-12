import { BLZ_CreateRenderer } from "./renderer";

interface Blaze {
  gl: WebGL2RenderingContext;
}

/**
 * Initializes the engine and creates the renderer
 *
 * @param canvas
 * @returns Blaze engine state
 */
export function BLZ_Init(canvas: HTMLCanvasElement): Blaze {
  const gl = BLZ_CreateRenderer(canvas);

  return {
    gl,
  };
}
