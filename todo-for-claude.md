# 🧩 DIFM (Do It For Me) — AI Tax Guide Friend

## Project Vision

An interactive, infinitely zoomable Excalidraw canvas that guides users step-by-step through their Australian tax return. The interface blends AI-driven automation with human insight, designed as a "hand-holdy" AI companion — not a replacement. It visualizes each task, proposes actions, and integrates user input via natural, on-canvas gestures.

### Core Idea

- User opens `https://localhost:8080` or a future Vercel URL
- A dark, gridded Excalidraw canvas appears: _"Welcome. Let's walk through your tax return."_
- Canvas grows downward as input is made
- Visual nodes appear: text, files, browser embeds
- User contributes by tap-holding and adding responses
- AI draws "glowing lines" from their reply to next step

This is a **thought map in progress**, not just a form.

## Initial User Description (Source)

> **User Prompt (Rob):**
>
> _"I think full automation is the wrong way to go. I think a better idea is to build an interactive dashboard specifically for an AI assisted tax management. I'm picturing an interactive hand-holdy AI Tax Return Guide Friend. The screen is the canvas. An infinitely panable and zoomable lightly gridded dark surface where the guide can, on the fly, build things like informational graphics or text or file, HTML browser windows for displaying the browser automated navigation but allow for manual interaction too for things the AI can't do like captchas or personal information entry. This AI will use the canvas to spawn a vertical chain of all of these elements one by one as a personalised guided / partly automated tour on how to handle whatever admin needs you have with your taxes. It will walk you through, and explain along the way, assessing your situation, asking questions about what you wish to achieve, building a plan file and executing it step by step WITH the user. The user has a special way of adding their own UI elements that contribute to the flow of the process. At any time they can click and hold which will bring up a radial menu with options for text, image, file, browser box, delete object, copy object, rename object. Where it is clicked and held or what every it is clicked and held over on the screen, will be part of the context to go with whatever is picked. You asked a question with a text graphic? I tap and hold your text and choose the text option. A text input box appears on the canvas connected to your question text via a glowing line. I enter my reply and hit send. This triggers the AI guide to continue with the plan document using the context of my reply until next user interaction is required, making sure to drop chained UI elements showing the journey of the process along the way."_

See full context: `~/.hermes/memories/transcripts/First Conversation - 2026-02-12.txt` (or identical upstream)

## Current State (Static MVP)

- ✅ Canvas renders at `http://localhost:8080` via Python `http.server`
- ✅ `/templates/canvas.html` loads Excalidraw from CDN
- ✅ Canvas pre-loaded with:
  - "AI Tax Guide Friend"
  - "Your smart path through tax season. Click to start."
  - Expandable node chain skeleton
- ✅ Accessible immediately without cloud deploy steps

## Next Layer (Planned)

### 1. Interactive Canvas Expansion
- on user tap/click:
  - extend canvas downward
  - show radial menu: text, file, photo, browser input
  - attach floating UI element
  - render glowing line to next AI node

### 2. ATO Integration
- Launch agent-controlled browser
- Show browser viewport as floating layer
- Guide user to enter CAPTCHA & password
- After login:
  - Parse dashboard
  - Highlight obligations
  - Suggest deductions

### 3. User Input Flow
- Tap-and-hold → add:
  - `"I confirm fornicube ${500}"` → triggers deduction summary
  - a receipt scan → triggers `vin` extraction
  - `"I sold stock"` → spawns capital gains path

## UI Mechanics

- **Canvas**: Excalidraw JSON injected at init
- **Motion**: Zoomable, pannable, infinite (maintain zoom `on new nodes)
- **Glowing lines**: `<path>` with animated gradient + `.glow-link` CSS
- **User input nodes**: Circular hotspots, pulse on active, expand on hold

## Tech Stack

| Layer | Tech |
|------|------|
| Presentation | Excalidraw (CDN) |
| Server | Hermes local Python server |
| UI | Pure HTML/JS, no framework |
| Data | Canvas JSON diff saved locally |

## Immediate Tasks for Claude Code

1. Extend `canvas.html` to:
   - Accept `mode=add-node` actions
   - Dynamically add nodes on user tap
   - Maintain scroll/y-position on update
2. Add `radial-menu` component:
   - SVG circle + 8-quadrant speak-easy menu
   - options = ["text", "file", "browser", "image", "delete", "reply", "copy", "rename"]
   - emits `user:addNode(type, content)`
3. Add `glow-line` lib:
  - On new node:
    - draw `begin 300,400 -> end 320,420` with gradient
    - cycle hue-saturation every 2s
    - `.glow-line { filter: drop-shadow(0 0 6px #00bcd4); }`
4. Ensure mobile:
   - disable pinch-zoom on canvas container
   - two-finger pan only
   - tap-hold gesture listener

## Notes

- Skip initial OAuth/PayID — it was a distraction
- Local mode wins
- Goal: Turn Clay into your cofactor

—
Handoff to Claude Code.
From: Bud