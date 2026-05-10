// Tap-and-hold (>HOLD_MS) opens a radial menu at the pointer location.
// Anchor context = the .node the press started on (or null for empty space).
// Movement >MOVE_TOLERANCE cancels the hold so it doesn't fight panning.

import { screenToWorld } from "./viewport.js";

const HOLD_MS = 420;
const MOVE_TOLERANCE = 8;

const ITEMS = [
  { id: "text",    label: "Text",    enabled: true  },
  { id: "file",    label: "File",    enabled: true  },
  { id: "image",   label: "Image",   enabled: true  },
  { id: "browser", label: "Browser", enabled: true  },
  { id: "reply",   label: "Reply",   enabled: true  },
  { id: "rename",  label: "Rename",  enabled: false },
  { id: "copy",    label: "Copy",    enabled: false },
  { id: "delete",  label: "Delete",  enabled: false },
];

let timer = null;
let downAt = null;
let activeMenu = null;
let onPickCb = null;

export function bindRadial(onPick) {
  onPickCb = onPick;
  const viewport = document.getElementById("viewport");

  viewport.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".radial, #zoom-controls")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    downAt = { x: e.clientX, y: e.clientY, target: e.target };
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (downAt) {
        openMenu(downAt.x, downAt.y, contextFor(downAt.target));
        downAt = null;
      }
    }, HOLD_MS);
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!downAt) return;
    if (Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > MOVE_TOLERANCE) {
      clearTimeout(timer);
      downAt = null;
    }
  });

  ["pointerup", "pointercancel"].forEach((ev) =>
    viewport.addEventListener(ev, () => {
      clearTimeout(timer);
      downAt = null;
    })
  );
}

function contextFor(target) {
  const node = target.closest(".node");
  return node ? { anchorStepId: node.dataset.stepId } : { anchorStepId: null };
}

function openMenu(sx, sy, ctx) {
  closeMenu();
  const wrap = document.createElement("div");
  wrap.className = "radial open";
  wrap.style.left = sx + "px";
  wrap.style.top = sy + "px";
  wrap.innerHTML = renderMenu();
  document.body.appendChild(wrap);
  activeMenu = wrap;

  wrap.querySelectorAll("[data-id]").forEach((el) => {
    if (el.classList.contains("disabled")) return;
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const world = screenToWorld(sx, sy);
      closeMenu();
      onPickCb && onPickCb(id, { ...ctx, world });
    });
  });

  setTimeout(() => {
    document.addEventListener("pointerdown", outsideClose, { once: true });
  }, 0);
}

function outsideClose(e) {
  if (activeMenu && !activeMenu.contains(e.target)) closeMenu();
}

function closeMenu() {
  if (activeMenu) {
    activeMenu.remove();
    activeMenu = null;
  }
}

function renderMenu() {
  const r = 95, ri = 32;
  const cx = 110, cy = 110;
  const n = ITEMS.length;
  const slices = ITEMS.map((item, i) => {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n;
    const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n;
    const am = (a0 + a1) / 2;
    const p = (a, rad) => `${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`;
    const path =
      `M ${p(a0, ri)} L ${p(a0, r)} A ${r} ${r} 0 0 1 ${p(a1, r)} ` +
      `L ${p(a1, ri)} A ${ri} ${ri} 0 0 0 ${p(a0, ri)} Z`;
    const lx = (cx + Math.cos(am) * ((r + ri) / 2)).toFixed(2);
    const ly = (cy + Math.sin(am) * ((r + ri) / 2)).toFixed(2);
    const cls = item.enabled ? "slice" : "slice disabled";
    return `<path class="${cls}" data-id="${item.id}" d="${path}"/>` +
           `<text class="label" x="${lx}" y="${ly}">${item.label}</text>`;
  }).join("");
  return `<svg viewBox="0 0 220 220" width="220" height="220">
    ${slices}
    <circle class="center" cx="${cx}" cy="${cy}" r="${ri - 4}"/>
    <text class="center-label" x="${cx}" y="${cy}">add</text>
  </svg>`;
}
