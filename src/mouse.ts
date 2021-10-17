export enum MOUSE {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
}

type cb = (pressed: boolean) => void;

const buttons: { [index: number]: boolean } = {};
const listeners: { [index: number]: cb[] } = {};

document.body.addEventListener("mousedown", (e) => {
  buttons[e.button] = true;
  listeners[e.button]?.forEach((cb) => cb(true));
});

document.body.addEventListener("mouseup", (e) => {
  buttons[e.button] = false;
  listeners[e.button]?.forEach((cb) => cb(false));
});

export function isMouseDown(button = MOUSE.LEFT) {
  return !!buttons[button];
}

export function addMouseListener(button: MOUSE, cb: cb) {
  if (listeners[button]) {
    listeners[button].push(cb);
  } else {
    listeners[button] = [cb];
  }
}

export function removeMouseListener(button: MOUSE, cb: cb) {
  if (listeners[button]) {
    for (let i = 0; i < listeners[button].length; i++) {
      if (cb === listeners[button][i]) {
        listeners[button].splice(i, 1);
        break;
      }
    }
  }
}
