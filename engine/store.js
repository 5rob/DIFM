// Plan state store. One plan in memory; subscribers re-render on mutation.

const state = {
  plan: null,
  listeners: new Set(),
};

export function loadPlan(plan) {
  state.plan = plan;
  if (!plan.state) plan.state = { stepStatus: {}, collected: {} };
  if (!plan.state.stepStatus) plan.state.stepStatus = {};
  if (!plan.state.collected) plan.state.collected = {};
  if (!plan.state.currentStepId) plan.state.currentStepId = plan.rootStepId;
  if (!plan.state.stepStatus[plan.rootStepId]) {
    plan.state.stepStatus[plan.rootStepId] = "active";
  }
  emit();
}

export function getPlan() {
  return state.plan;
}

export function subscribe(fn) {
  state.listeners.add(fn);
  return () => state.listeners.delete(fn);
}

function emit() {
  state.listeners.forEach((fn) => fn(state.plan));
}

export function addStep(step, edge) {
  state.plan.steps[step.id] = step;
  if (edge) state.plan.edges.push(edge);
  if (!state.plan.state.stepStatus[step.id]) {
    state.plan.state.stepStatus[step.id] =
      step.kind === "user-input" ? "active" : "pending";
  }
  emit();
}

export function setCollected(stepId, value) {
  state.plan.state.collected[`${stepId}.value`] = value;
  emit();
}

export function setStatus(stepId, status) {
  state.plan.state.stepStatus[stepId] = status;
  if (status === "active") state.plan.state.currentStepId = stepId;
  emit();
}

export function setPosition(stepId, position) {
  const step = state.plan.steps[stepId];
  if (!step) return;
  step.position = position;
  emit();
}

export function addEdge(edge) {
  state.plan.edges.push(edge);
  emit();
}

// Cut any existing wire(s) leading into target, then connect from source.
export function replaceIncomingEdges(targetStepId, sourceStepId, kind = "next") {
  state.plan.edges = state.plan.edges.filter((e) => e.to !== targetStepId);
  state.plan.edges.push({ from: sourceStepId, to: targetStepId, kind });
  emit();
}
