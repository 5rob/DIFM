## Visual Design System

### Grid & Background
- Canvas: infinite zoomable Excalidraw grid
- Background: `#020617` (Slate-950) with 40px light grid pattern

### Element Colors

| Type | Fill Color | Fill Alpha | Stroke | Text |
|------|------------|-------------|--------|------|
| Question Node | `rgba(8, 51, 68, 0.4)` | 40% | `#22d3ee` | white |
| Browser Embed | `rgba(120, 53, 15, 0.3)` | 30% | `#fbbf24` | `#cbaf02` |
| User Response | `rgba(30, 41, 59, 0.5)` | 50% | `#94a3b8` | `#e2e8f0` |
| Automation Step | `rgba(6, 78, 59, 0.4)` | 40% | `#34d399` | white |
| Link (Glowing Line) | — | — | `#22d3ee` → `#10b981` | — |

### Typography
- Font: `Virgil` (hand-drawn, default)
- Sizes:
  - Titles: 24–32px
  - Descriptions: 18–22px
  - Labels/Annotations: 16px (min)
- Weight: `600` default

### Layering Order
1. Background zones (financial categories)
2. Browser snapshots
3. AI-placed UI elements (questions, hints)
4. User responses
5. Glowing lines and connections

### Motion & Feedback
- Glowing lines: pulse gently (CSS animation)
- Hotspots: pulse `#22d3ee` on hover
- Confirmed steps: green ripple effect
- Errors: `#fb7185` border pulse

Used in tax-guide v0.1.0.