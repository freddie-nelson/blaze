type cb = (pressed: boolean) => void;

const keys: { [index: string]: boolean } = {};
const listeners: { [index: string]: cb[] } = {};

document.body.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  listeners[e.code]?.forEach((cb) => cb(true));
});

document.body.addEventListener("keyup", (e) => {
  keys[e.code] = false;
  listeners[e.code]?.forEach((cb) => cb(false));
});

export function isKeyPressed(code: string) {
  return !!keys[code];
}

export function addKeyListener(code: string, cb: cb) {
  if (listeners[code]) {
    listeners[code].push(cb);
  } else {
    listeners[code] = [cb];
  }
}

export function removeKeyListener(code: string, cb: cb) {
  if (listeners[code]) {
    for (let i = 0; i < listeners[code].length; i++) {
      if (cb === listeners[code][i]) {
        listeners[code].splice(i, 1);
        break;
      }
    }
  }
}
