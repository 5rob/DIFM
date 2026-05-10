// Draw SVG paths between node anchor points. Connector layer is offset by
// SVG_OFFSET so negative world coordinates render correctly inside the SVG.

const svg = document.getElementById("connectors");
const SVG_OFFSET = 10000;
const NODE_W = 360;
const NODE_H_EST = 160;

export function renderConnectors(plan, positions) {
  ensureDefs();
  for (const n of [...svg.querySelectorAll("path.connector")]) n.remove();

  for (const edge of plan.edges) {
    const a = positions[edge.from];
    const b = positions[edge.to];
    if (!a || !b) continue;

    const fr = nodeRect(edge.from) || fallbackRect(a);
    const tr = nodeRect(edge.to) || fallbackRect(b);

    // Anchor at the bottom-center of the source and the top-center of the
    // target. Vertical bezier handles produce a natural downward S-curve
    // even when the target is offset to a side column.
    const x1 = fr.midX + SVG_OFFSET;
    const y1 = fr.bottom + SVG_OFFSET;
    const x2 = tr.midX + SVG_OFFSET;
    const y2 = tr.top + SVG_OFFSET;

    const dy = Math.max(40, Math.abs(y2 - y1) / 2);
    const d = `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", `connector ${edge.kind}`);
    svg.appendChild(path);
  }
}

function nodeRect(stepId) {
  const el = document.querySelector(`.node[data-step-id="${cssEscape(stepId)}"]`);
  if (!el) return null;
  const left = parseFloat(el.style.left);
  const top = parseFloat(el.style.top);
  const w = el.offsetWidth || NODE_W;
  const h = el.offsetHeight || NODE_H_EST;
  return {
    left, top,
    right: left + w,
    bottom: top + h,
    midX: left + w / 2,
    midY: top + h / 2,
  };
}

function fallbackRect(p) {
  return {
    left: p.x,
    top: p.y,
    right: p.x + NODE_W,
    bottom: p.y + NODE_H_EST,
    midX: p.x + NODE_W / 2,
    midY: p.y + NODE_H_EST / 2,
  };
}

function cssEscape(s) {
  return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/"/g, '\\"');
}

function ensureDefs() {
  if (svg.querySelector("defs")) return;
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const ns = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(ns, "linearGradient");
  g.setAttribute("id", "glowReply");
  g.setAttribute("x1", "0"); g.setAttribute("y1", "0");
  g.setAttribute("x2", "1"); g.setAttribute("y2", "0");
  for (const [off, color] of [["0", "#22d3ee"], ["1", "#10b981"]]) {
    const stop = document.createElementNS(ns, "stop");
    stop.setAttribute("offset", off);
    stop.setAttribute("stop-color", color);
    g.appendChild(stop);
  }
  defs.appendChild(g);
  svg.appendChild(defs);
}
