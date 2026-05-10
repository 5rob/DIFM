// Drag from a node's output dot to another node's input dot to wire them up.
// If the target already has an incoming edge it is cut and replaced.
//
// Capture phase + stopPropagation so this beats drag.js / radial.js / pan.

import { replaceIncomingEdges } from "./store.js";
import { screenToWorld } from "./viewport.js";

const SVG_OFFSET = 10000;

let dragging = null;

export function bindWire() {
  const viewport = document.getElementById("viewport");

  viewport.addEventListener("pointerdown", (e) => {
    const dot = e.target.closest(".dot.out");
    if (!dot) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.stopPropagation();
    e.preventDefault();

    dragging = {
      fromStepId: dot.dataset.stepId,
      pointerId: e.pointerId,
    };
    try { viewport.setPointerCapture(e.pointerId); } catch {}
    ensureGhost();
    updateGhost(e.clientX, e.clientY);
    document.body.classList.add("wiring");
  }, true);

  viewport.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== dragging.pointerId) return;
    updateGhost(e.clientX, e.clientY);
    e.preventDefault();
  }, true);

  function endWire(e) {
    if (!dragging || e.pointerId !== dragging.pointerId) return;
    const stop = e;

    // Resolve drop target. Allow dropping anywhere on a target node's
    // surface — not just the input dot — for friendlier touch UX.
    const el = document.elementFromPoint(stop.clientX, stop.clientY);
    const targetNode = el && el.closest(".node");
    const targetStepId = targetNode && targetNode.dataset.stepId;

    if (targetStepId && targetStepId !== dragging.fromStepId) {
      replaceIncomingEdges(targetStepId, dragging.fromStepId, "next");
    }

    removeGhost();
    document.body.classList.remove("wiring");
    dragging = null;
  }
  viewport.addEventListener("pointerup", endWire, true);
  viewport.addEventListener("pointercancel", endWire, true);
}

function ensureGhost() {
  const svg = document.getElementById("connectors");
  if (svg.querySelector("path.ghost-wire")) return;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "path");
  g.setAttribute("class", "ghost-wire");
  svg.appendChild(g);
}

function removeGhost() {
  const g = document.querySelector("#connectors path.ghost-wire");
  if (g) g.remove();
}

function updateGhost(clientX, clientY) {
  if (!dragging) return;
  const fromNode = document.querySelector(
    `.node[data-step-id="${cssEscape(dragging.fromStepId)}"]`
  );
  if (!fromNode) return;

  const fl = parseFloat(fromNode.style.left) || 0;
  const ft = parseFloat(fromNode.style.top) || 0;
  const fw = fromNode.offsetWidth;
  const fh = fromNode.offsetHeight;

  const x1 = fl + fw / 2 + SVG_OFFSET;
  const y1 = ft + fh + SVG_OFFSET;

  const w = screenToWorld(clientX, clientY);
  const x2 = w.x + SVG_OFFSET;
  const y2 = w.y + SVG_OFFSET;

  const dy = Math.max(40, Math.abs(y2 - y1) / 2);
  const d = `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
  const g = document.querySelector("#connectors path.ghost-wire");
  if (g) g.setAttribute("d", d);
}

function cssEscape(s) {
  return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/"/g, '\\"');
}
