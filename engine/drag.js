// Drag a node by its body (not its interactive controls). Movement >threshold
// commits the move into step.position so auto-layout treats it as pinned.

import { view } from "./viewport.js";
import { setPosition, getPlan } from "./store.js";
import { renderConnectors } from "./connectors.js";
import { getPositions } from "./render.js";

const DRAG_THRESHOLD = 8;
const INTERACTIVE_SEL =
  "button, textarea, input, a, select, iframe, .choice, .dropzone, .dot";

let downAt = null;
let dragging = null;
let rafPending = false;

function scheduleConnectorRedraw() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    renderConnectors(getPlan(), getPositions());
  });
}

export function bindDrag() {
  const viewport = document.getElementById("viewport");

  viewport.addEventListener("pointerdown", (e) => {
    const node = e.target.closest(".node");
    if (!node) return;
    if (e.target.closest(INTERACTIVE_SEL)) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    downAt = {
      pointerId: e.pointerId,
      clientX: e.clientX,
      clientY: e.clientY,
      stepId: node.dataset.stepId,
      node,
      startLeft: parseFloat(node.style.left) || 0,
      startTop: parseFloat(node.style.top) || 0,
    };
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!downAt || e.pointerId !== downAt.pointerId) return;
    const dx = e.clientX - downAt.clientX;
    const dy = e.clientY - downAt.clientY;

    if (!dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      // Don't fight the radial menu: if it's already open, abandon drag.
      if (document.querySelector(".radial.open")) {
        downAt = null;
        return;
      }
      dragging = downAt;
      dragging.node.classList.add("dragging");
      try { viewport.setPointerCapture(e.pointerId); } catch {}
    }

    const wx = dragging.startLeft + dx / view.scale;
    const wy = dragging.startTop + dy / view.scale;
    dragging.node.style.left = wx + "px";
    dragging.node.style.top = wy + "px";
    scheduleConnectorRedraw();
    e.preventDefault();
  });

  function endDrag(e) {
    if (!downAt || e.pointerId !== downAt.pointerId) return;
    if (dragging) {
      const x = parseFloat(dragging.node.style.left) || 0;
      const y = parseFloat(dragging.node.style.top) || 0;
      const stepId = dragging.stepId;
      dragging.node.classList.remove("dragging");
      dragging = null;
      setPosition(stepId, { x, y });
    }
    downAt = null;
  }
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
}
