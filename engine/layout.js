// Auto-layout: vertical chain from rootStepId. Branches and replies offset
// to a new column to the right. Manual `position` on a step overrides.

const NODE_W = 360;
const NODE_H_EST = 160;
const V_GAP = 40;
const COL_W = NODE_W + 80;

export function autoLayout(plan) {
  const pos = {};
  const colNextY = {};
  const visited = new Set();

  function place(id, col) {
    if (visited.has(id)) return;
    visited.add(id);
    const y = colNextY[col] || 0;
    pos[id] = { x: col * COL_W, y };
    colNextY[col] = y + NODE_H_EST + V_GAP;

    const outs = plan.edges.filter((e) => e.from === id);
    for (const edge of outs) {
      const nextCol =
        edge.kind === "branch" || edge.kind === "reply" ? col + 1 : col;
      place(edge.to, nextCol);
    }
  }

  if (plan.rootStepId && plan.steps[plan.rootStepId]) {
    place(plan.rootStepId, 0);
  }

  for (const id of Object.keys(plan.steps)) {
    if (plan.steps[id].position) {
      pos[id] = plan.steps[id].position;
      continue;
    }
    if (!pos[id]) {
      const y = colNextY[0] || 0;
      pos[id] = { x: 0, y };
      colNextY[0] = y + NODE_H_EST + V_GAP;
    }
  }

  return pos;
}
