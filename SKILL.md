---
name: tax-guide
version: 0.1.0
description: "Interactive AI Tax Guide Friend with Excalidraw canvas and ATO automation."
author: Rob (design), Bud (implementation)
license: MIT
dependencies: ["@excalidraw/excalidraw", "puppeteer", "hermes-tools-browser"]
category: tax, automation, UI, canvas

---

# AI Tax Guide Friend

Builds a dynamic, interactive tax session on an infinite Excalidraw canvas. The guide starts with ATO login automation, integrates browser viewports into the canvas, and prompts user interaction via tap-and-hold radial menus. Automatically identifies filing obligations and deduction opportunities.

## Scope

- Australian tax system (ATO)
- myGov login + myTax interface
- High-context visual guidance for each step
- User adds input via text, file, or browser confirmation
- Real-time update of tax position (refunds, debts, risks)

## Workflow

1. Initialize Excalidraw canvas with dark-grid background
2. Start Puppeteer-controlled browser instance
3. Load ATO/myGov login page
4. Embed browser viewport as resizable layer in canvas
5. Draw first node: "Welcome — Ready to begin your return?" [Button]
6. On user click:
   - Enter CAPTCHA manually (AI waits)
   - Type password after confirming blur on input field
   - Once logged in, snapshot dashboard
   - Place on canvas as floating embed node
7. Parse dashboard using vision_analyze
8. Generate next steps: obligations, deduction suggestions, deadlines
9. Draw question node: "Confirm items for this year's return?" with options
10. On user selection:
    - Extend canvas downward
    - Attach glowing lines to response
    - Spawn new embedded browser session (automatic fill)
    - Continue loop

## Visual Language

- Background: Slate-950 with 40px dark grid (from architecture-diagram)
- Text nodes: Left-aligned, padded boxes with subtle glow
- Browser embeds: Floating, movable tiles with "[AUTOMATION]" header
- User input zones: Circular hotspots, pulsing gently
- Glowing lines: Yellow-to-cyan gradient (pending), green (confirmed)

## Browser Integration

- Use hermes_tools.browser_navigate/buffer_type etc.
- On sensitive fields (password, ID), pause and signal user via canvas annotation
- After user input, resume automation
- All screenshots are 400x300 cropped snapshots

## Pitfalls

- Never attempt to bypass CAPTCHA
- Do not store passwords
- Glowing lines break if canvas zoom changes — store relative coordinates
- User inactivity timeout: 10 minutes (save state and pause)

## Verification

- Canvas loads and is pannable/zoomable
- Browser appears in canvas
- CAPTCHA step stops automation
- User input triggers next phase
- Glowing lines connect logically

## Acknowledgements

Built with \[Excalidraw \].

---

## Update Log

**2026-05-10**
- Initialized repository at `https://github.com/5rob/DIFM.git`
- Added README.md with live Vercel link
- Set up local git, SSH deploy key pending user upload
- Verified Excalidraw canvas template loads
- Integrated with Hermes skills system
- Implemented visual design system in `references/visual-design.md`
- Added interactive entry script `templates/canvas-init.js`
- Next: secure deploy key and push first commit
