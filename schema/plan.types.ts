// DIFM Plan v1 — TypeScript type mirror of plan.schema.json.
// Reference only; the engine is plain ES modules and reads JSON at runtime.

export type StepKind =
  | "ai-message"
  | "ai-question"
  | "user-input"
  | "automation"
  | "browser-embed"
  | "decision"
  | "summary";

export type EdgeKind = "next" | "reply" | "derived" | "branch";

export type StepStatus =
  | "pending"
  | "active"
  | "completed"
  | "skipped"
  | "blocked";

export type ExpectedInput = "text" | "file" | "image" | "choice" | "browser-confirm";
export type InputType = Exclude<ExpectedInput, "choice">;

export interface Position {
  x: number;
  y: number;
}

export interface BaseStep {
  id: string;
  kind: StepKind;
  title: string;
  position?: Position;
  dependsOn?: string[];
  meta?: Record<string, unknown>;
}

export interface AiMessageStep extends BaseStep {
  kind: "ai-message";
  content: string;
}

export interface AiQuestionStep extends BaseStep {
  kind: "ai-question";
  prompt: string;
  expectedInputs: ExpectedInput[];
  choices?: { id: string; label: string }[];
}

export interface UserInputStep extends BaseStep {
  kind: "user-input";
  inputType: InputType;
  anchorStepId: string;
  value?: unknown;
}

export interface AutomationStep extends BaseStep {
  kind: "automation";
  tool: string;
  args?: Record<string, unknown>;
  outputs?: string[];
}

export interface BrowserEmbedStep extends BaseStep {
  kind: "browser-embed";
  url: string;
  mode: "view" | "interact" | "handoff";
  handoffReason?: string;
}

export interface DecisionStep extends BaseStep {
  kind: "decision";
  condition: string;
  branches: Record<string, string>;
}

export interface SummaryStep extends BaseStep {
  kind: "summary";
  sourceStepIds: string[];
  content: string;
}

export type Step =
  | AiMessageStep
  | AiQuestionStep
  | UserInputStep
  | AutomationStep
  | BrowserEmbedStep
  | DecisionStep
  | SummaryStep;

export interface Edge {
  from: string;
  to: string;
  kind: EdgeKind;
  label?: string;
}

export interface PlanState {
  currentStepId?: string;
  stepStatus: Record<string, StepStatus>;
  collected: Record<string, unknown>;
}

export interface Plan {
  id: string;
  version: 1;
  title: string;
  summary?: string;
  createdAt?: string;
  context?: Record<string, unknown>;
  rootStepId: string;
  steps: Record<string, Step>;
  edges: Edge[];
  state?: PlanState;
}
