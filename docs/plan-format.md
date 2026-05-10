# DIFM Plan Format (v1)

A **plan** is a JSON document describing a guided journey the canvas renders. The AI guide authors and mutates plans on the fly; the engine renders whatever's there.

Schema: [`/schema/plan.schema.json`](../schema/plan.schema.json) · TypeScript mirror: [`/schema/plan.types.ts`](../schema/plan.types.ts)

## Top level

| field | type | required | notes |
|---|---|---|---|
| `id` | string | yes | unique identifier |
| `version` | integer | yes | format version (currently `1`) |
| `title` | string | yes | shown in the canvas heading |
| `summary` | string | no | one-line description |
| `createdAt` | ISO 8601 string | no | |
| `context` | object | no | free-form metadata (locale, fy, etc.) |
| `rootStepId` | string | yes | first step the canvas renders |
| `steps` | object | yes | map of `stepId → Step` |
| `edges` | array | yes | directed connections between steps |
| `state` | object | no | runtime status (engine fills if absent) |

## Steps

Every step has `id`, `kind`, `title`. Optional: `position`, `dependsOn`, `meta`.

### `kind` reference

| kind | who drives | extra fields |
|---|---|---|
| `ai-message` | guide narrates | `content` |
| `ai-question` | guide asks | `prompt`, `expectedInputs[]`, `choices[]?` |
| `user-input` | user contributes (spawned from radial menu) | `inputType`, `anchorStepId`, `value?` |
| `automation` | headless tool runs | `tool`, `args?`, `outputs[]?` |
| `browser-embed` | live browser view or hand-off | `url`, `mode`, `handoffReason?` |
| `decision` | route on collected data | `condition`, `branches` |
| `summary` | guide recaps | `sourceStepIds[]`, `content` |

`expectedInputs` values: `text`, `file`, `image`, `choice`, `browser-confirm`.
`inputType` values: same minus `choice`.
`mode` (browser-embed): `view`, `interact`, or `handoff` (engine pauses, asks user to act).

### Example step

```json
{
  "id": "ask_situation",
  "kind": "ai-question",
  "title": "Your situation this year",
  "prompt": "Briefly: what's your work situation?",
  "expectedInputs": ["text"]
}
```

## Edges

```json
{ "from": "stepA", "to": "stepB", "kind": "next" }
```

`kind`:
- `next` — normal sequential flow
- `reply` — user-input answering an `ai-question`; rendered as a glow line
- `derived` — guide-produced step deriving from prior data
- `branch` — outcome of a `decision` or a choice; pair with `label` matching either a key in `branches` or a `choice.id`

## State

```json
{
  "currentStepId": "ask_situation",
  "stepStatus": { "welcome": "completed", "ask_situation": "active" },
  "collected": { "ask_situation.value": "I'm a sole trader" }
}
```

`stepStatus` values: `pending`, `active`, `completed`, `skipped`, `blocked`.

`collected` keys follow `<stepId>.value` for primary outputs; automation steps may write `<stepId>.<outputName>` for each item in `outputs[]`.

## Position handling

Omit `position` to let the engine auto-layout (vertical chain from root, branches and replies offset to the right). Set `position: { x, y }` to pin a step at exact world coordinates — used when the user spawns a node at a tap-and-hold location.

## Evolution

Bump `version` for breaking changes. Additive changes (new `kind`, new edge `kind`) can stay at `version: 1` if older renderers degrade gracefully (skip unknown step kinds, render unknown edges as plain lines).

## Examples

- [`empty-plan.json`](../schema/examples/empty-plan.json) — minimal seed
- [`au-tax-return.plan.json`](../schema/examples/au-tax-return.plan.json) — Australian tax return reference flow
