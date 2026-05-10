// Bootstrap. Picks a plan from ?plan=… or defaults to the AU tax flow,
// loads it, mounts the renderer, and wires the radial menu.

import { loadPlan, getPlan, addStep } from "./store.js";
import { startRender } from "./render.js";
import { bindRadial } from "./radial.js";
import { bindDrag } from "./drag.js";
import { bindWire } from "./wire.js";
import { focusOn, zoomAt, view, applyTransform } from "./viewport.js";

const DEFAULT_PLAN = "schema/examples/au-tax-return.plan.json";
const planUrl = new URLSearchParams(location.search).get("plan") || DEFAULT_PLAN;

async function boot() {
  let plan;
  try {
    const res = await fetch(planUrl, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    plan = await res.json();
  } catch (err) {
    console.error("Plan failed to load:", planUrl, err);
    plan = await (await fetch("schema/examples/empty-plan.json")).json();
  }
  loadPlan(plan);
  startRender();
  focusOn(180, 80, 1);
  bindWire();
  bindRadial(handlePick);
  bindDrag();
  wireZoomControls();
  setHudTitle(plan.title);
}

function handlePick(id, ctx) {
  const plan = getPlan();
  const anchored = !!ctx.anchorStepId;
  const anchorId = ctx.anchorStepId || plan.rootStepId;
  const newId = `node_${Date.now().toString(36)}`;
  // Anchored nodes flow with auto-layout; free-floaters pin at tap location.
  const positionField = anchored ? {} : { position: ctx.world };
  const edge = anchored
    ? { from: anchorId, to: newId, kind: "reply" }
    : null;

  if (id === "text" || id === "reply") {
    addStep(
      {
        id: newId, kind: "user-input", title: id === "reply" ? "Reply" : "Note",
        inputType: "text", anchorStepId: anchorId, ...positionField,
      },
      edge
    );
    return;
  }
  if (id === "file") {
    addStep(
      {
        id: newId, kind: "user-input", title: "File",
        inputType: "file", anchorStepId: anchorId, ...positionField,
      },
      edge
    );
    return;
  }
  if (id === "image") {
    addStep(
      {
        id: newId, kind: "user-input", title: "Image",
        inputType: "image", anchorStepId: anchorId, ...positionField,
      },
      edge
    );
    return;
  }
  if (id === "browser") {
    const url = prompt("URL to open?", "https://");
    if (!url || url === "https://") return;
    addStep(
      {
        id: newId, kind: "browser-embed", title: "Browser",
        url, mode: "view", ...positionField,
      },
      edge
    );
    return;
  }
}

function wireZoomControls() {
  const ctrl = document.getElementById("zoom-controls");
  if (!ctrl) return;
  ctrl.querySelector("[data-zoom='in']")
    .addEventListener("click", () => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1.2));
  ctrl.querySelector("[data-zoom='out']")
    .addEventListener("click", () => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1 / 1.2));
  ctrl.querySelector("[data-zoom='reset']")
    .addEventListener("click", () => {
      view.x = 0; view.y = 0; view.scale = 1;
      applyTransform();
      focusOn(180, 80, 1);
    });
}

function setHudTitle(title) {
  const el = document.querySelector(".hud-title");
  if (el && title) el.textContent = "DIFM · " + title;
}

boot();
