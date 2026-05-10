// Pan/zoom of #world inside #viewport. Pointer-driven; supports two-finger pinch
// on touch and ctrl-wheel / wheel on desktop. Pans only when pointer is on
// background (not on a node or radial menu).

const viewport = document.getElementById("viewport");
const world = document.getElementById("world");

const MIN_SCALE = 0.2;
const MAX_SCALE = 3;

export const view = { x: 0, y: 0, scale: 1 };

export function applyTransform() {
  world.style.transform =
    `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
}

export function panBy(dx, dy) {
  view.x += dx;
  view.y += dy;
  applyTransform();
}

export function zoomAt(clientX, clientY, factor) {
  const newScale = clamp(view.scale * factor, MIN_SCALE, MAX_SCALE);
  const real = newScale / view.scale;
  view.x = clientX - (clientX - view.x) * real;
  view.y = clientY - (clientY - view.y) * real;
  view.scale = newScale;
  applyTransform();
}

export function focusOn(worldX, worldY, scale = view.scale) {
  view.scale = clamp(scale, MIN_SCALE, MAX_SCALE);
  view.x = window.innerWidth / 2 - worldX * view.scale;
  view.y = window.innerHeight / 3 - worldY * view.scale;
  applyTransform();
}

export function screenToWorld(sx, sy) {
  return { x: (sx - view.x) / view.scale, y: (sy - view.y) / view.scale };
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function isInteractive(target) {
  return !!target.closest(".node, .radial, #zoom-controls");
}

const pointers = new Map();
let panLast = null;
let pinchLast = null;

viewport.addEventListener("pointerdown", (e) => {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 1 && !isInteractive(e.target)) {
    panLast = { x: e.clientX, y: e.clientY };
    viewport.classList.add("panning");
    viewport.setPointerCapture(e.pointerId);
  }
  if (pointers.size === 2) {
    pinchLast = pinchOf([...pointers.values()]);
    panLast = null;
  }
});

viewport.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  const p = pointers.get(e.pointerId);
  p.x = e.clientX;
  p.y = e.clientY;

  if (pointers.size === 1 && panLast) {
    panBy(e.clientX - panLast.x, e.clientY - panLast.y);
    panLast = { x: e.clientX, y: e.clientY };
  } else if (pointers.size === 2 && pinchLast) {
    const cur = pinchOf([...pointers.values()]);
    const factor = cur.dist / pinchLast.dist;
    zoomAt(cur.cx, cur.cy, factor);
    panBy(cur.cx - pinchLast.cx, cur.cy - pinchLast.cy);
    pinchLast = cur;
  }
});

function endPointer(e) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchLast = null;
  if (pointers.size === 0) {
    panLast = null;
    viewport.classList.remove("panning");
  } else if (pointers.size === 1) {
    const [only] = pointers.values();
    panLast = { x: only.x, y: only.y };
  }
}
viewport.addEventListener("pointerup", endPointer);
viewport.addEventListener("pointercancel", endPointer);

function pinchOf(pts) {
  const [a, b] = pts;
  const dx = b.x - a.x, dy = b.y - a.y;
  return {
    dist: Math.hypot(dx, dy) || 1,
    cx: (a.x + b.x) / 2,
    cy: (a.y + b.y) / 2,
  };
}

viewport.addEventListener("wheel", (e) => {
  e.preventDefault();
  const factor = Math.exp(-e.deltaY * 0.0015);
  zoomAt(e.clientX, e.clientY, factor);
}, { passive: false });

applyTransform();
