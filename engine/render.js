// Render plan steps into the #nodes layer and connectors between them.
// Two-pass per change: place nodes (so they get measured), then draw connectors
// against the measured offsetWidth/Height.

import { getPlan, subscribe, setCollected, setStatus } from "./store.js";
import { autoLayout } from "./layout.js";
import { renderConnectors } from "./connectors.js";

const nodesEl = document.getElementById("nodes");

const KIND_LABELS = {
  "ai-message": "Guide",
  "ai-question": "Question",
  "user-input": "You",
  "automation": "Automation",
  "browser-embed": "Browser",
  "decision": "Decision",
  "summary": "Summary",
};

let positions = {};

export function startRender() {
  subscribe(rerender);
  rerender(getPlan());
}

export function getPositions() {
  return positions;
}

function rerender(plan) {
  if (!plan) return;
  positions = autoLayout(plan);
  nodesEl.innerHTML = "";
  for (const id of Object.keys(plan.steps)) {
    const step = plan.steps[id];
    const pos = positions[id];
    const el = renderStep(step, plan);
    el.style.left = pos.x + "px";
    el.style.top = pos.y + "px";
    nodesEl.appendChild(el);
  }
  // Defer to next frame so layout/measurement is settled before drawing paths.
  requestAnimationFrame(() => renderConnectors(plan, positions));
}

function renderStep(step, plan) {
  const el = document.createElement("div");
  el.className = "node";
  el.dataset.kind = step.kind;
  el.dataset.stepId = step.id;
  el.dataset.status = (plan.state.stepStatus && plan.state.stepStatus[step.id]) || "pending";

  const kindLabel = document.createElement("div");
  kindLabel.className = "node-kind";
  kindLabel.textContent = KIND_LABELS[step.kind] || step.kind;
  el.appendChild(kindLabel);

  const title = document.createElement("h3");
  title.className = "node-title";
  title.textContent = step.title;
  el.appendChild(title);

  const body = document.createElement("div");
  body.className = "node-body";
  el.appendChild(body);
  renderBody(body, step, plan);

  const dotIn = document.createElement("div");
  dotIn.className = "dot in";
  dotIn.dataset.stepId = step.id;
  dotIn.dataset.dot = "in";
  el.appendChild(dotIn);

  const dotOut = document.createElement("div");
  dotOut.className = "dot out";
  dotOut.dataset.stepId = step.id;
  dotOut.dataset.dot = "out";
  el.appendChild(dotOut);

  return el;
}

function renderBody(body, step, plan) {
  switch (step.kind) {
    case "ai-message":
    case "summary":
      appendParagraph(body, step.content);
      break;

    case "ai-question": {
      appendParagraph(body, step.prompt);
      if (step.choices && step.choices.length) {
        const list = document.createElement("div");
        list.className = "choice-list";
        step.choices.forEach((c) => {
          const b = document.createElement("button");
          b.className = "choice";
          b.textContent = c.label;
          b.addEventListener("click", () => {
            setCollected(step.id, c.id);
            setStatus(step.id, "completed");
            advance(step.id, c.id);
          });
          list.appendChild(b);
        });
        body.appendChild(list);
      }
      const inputs = (step.expectedInputs || []).filter((i) => i !== "choice");
      if (inputs.length) {
        const hint = document.createElement("div");
        hint.className = "hint";
        hint.textContent = `Tap-and-hold to add: ${inputs.join(", ")}`;
        body.appendChild(hint);
      }
      break;
    }

    case "user-input": {
      if (step.inputType === "text") {
        const ta = document.createElement("textarea");
        ta.className = "text-input";
        ta.placeholder = "Type your reply…";
        ta.value = step.value || "";
        ta.addEventListener("change", () => {
          step.value = ta.value;
          setCollected(step.id, ta.value);
          setStatus(step.id, "completed");
        });
        body.appendChild(ta);
      } else if (step.inputType === "file" || step.inputType === "image") {
        const drop = document.createElement("div");
        drop.className = "dropzone";
        drop.textContent = step.value
          ? formatFile(step.value)
          : (step.inputType === "image" ? "Drop image / tap to choose" : "Drop file / tap to choose");
        const input = document.createElement("input");
        input.type = "file";
        input.accept = step.inputType === "image" ? "image/*" : "*/*";
        input.style.display = "none";
        drop.addEventListener("click", () => input.click());
        input.addEventListener("change", () => {
          if (input.files[0]) {
            const f = input.files[0];
            const meta = { name: f.name, size: f.size, type: f.type };
            step.value = meta;
            drop.textContent = formatFile(meta);
            setCollected(step.id, meta);
            setStatus(step.id, "completed");
          }
        });
        body.appendChild(drop);
        body.appendChild(input);
      } else if (step.inputType === "browser-confirm") {
        const b = document.createElement("button");
        b.className = "choice";
        b.textContent = "I've completed this in the browser";
        b.addEventListener("click", () => {
          setCollected(step.id, true);
          setStatus(step.id, "completed");
        });
        body.appendChild(b);
      }
      break;
    }

    case "automation": {
      const out = step.outputs && step.outputs.length
        ? ` · captures: ${step.outputs.join(", ")}`
        : "";
      appendParagraph(body, `Tool: ${step.tool}${out}`);
      break;
    }

    case "browser-embed": {
      if (step.handoffReason) {
        const note = document.createElement("div");
        note.className = "handoff-note";
        note.textContent = step.handoffReason;
        body.appendChild(note);
      }
      const link = document.createElement("a");
      link.className = "embed-link";
      link.href = step.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `↗ Open ${truncate(step.url, 48)}`;
      body.appendChild(link);
      const b = document.createElement("button");
      b.className = "choice";
      b.style.marginTop = "8px";
      b.textContent = step.mode === "handoff" ? "Done — continue" : "Reviewed — continue";
      b.addEventListener("click", () => {
        setStatus(step.id, "completed");
        advance(step.id);
      });
      body.appendChild(b);
      break;
    }

    case "decision": {
      appendParagraph(body, `If: ${step.condition}`);
      const list = document.createElement("div");
      list.className = "choice-list";
      Object.entries(step.branches).forEach(([label, target]) => {
        const b = document.createElement("button");
        b.className = "choice";
        b.textContent = `${label} → ${target}`;
        b.addEventListener("click", () => {
          setCollected(step.id, label);
          setStatus(step.id, "completed");
          advance(step.id, label);
        });
        list.appendChild(b);
      });
      body.appendChild(list);
      break;
    }
  }
}

function advance(fromStepId, branchLabel) {
  const plan = getPlan();
  const candidates = plan.edges.filter((e) => e.from === fromStepId);
  let next = null;
  if (branchLabel) {
    next = candidates.find((e) => e.kind === "branch" && e.label === branchLabel);
  }
  if (!next) {
    next = candidates.find((e) => e.kind === "next" || e.kind === "derived");
  }
  if (next) setStatus(next.to, "active");
}

function appendParagraph(parent, text) {
  const p = document.createElement("p");
  p.textContent = text || "";
  parent.appendChild(p);
}

function formatFile(meta) {
  const kb = meta.size != null ? ` (${(meta.size / 1024).toFixed(1)} KB)` : "";
  return `${meta.name || "file"}${kb}`;
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
