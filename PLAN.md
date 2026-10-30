# Astera Studio — Implementation Plan

## 1. Context

Take-home for **Muhammad Yousuf (FAST-NUCES, 2023)**. Brief: a clickable, responsive, touch-friendly HTML mockup of **Astera Studio**, a chat-first analytics tool whose charts are fed by data pipelines. It must adapt (not shrink) to **iPhone 375px, iPad 768–1024px, desktop 1440px**, with no hover-only interactions. There is no backend; all data is made up.

**Goal:** a mockup that stands out through **judgment, not feature count**. The story for the interview: *"I designed for trust. Users can see when data is stale, understand why in plain language, and fix it safely from their phone, with AI proposing and a human approving."* That mirrors Astera's real "governed AI" model (AI proposes → human approves → server runs and logs).

**Hard user requirements**
- Quality over speed. Work phase by phase, and explain each phase simply afterwards.
- The UI must **not** look AI-generated or "vibe-coded".
- Plain **JavaScript**, no TypeScript. Code must be simple enough to defend in an interview.

## 2. Tech stack (with reasons)

| Choice | Why |
|---|---|
| **Vite + React 18 (JavaScript)** | Fast setup; components keep 3 screens × 3 layouts manageable. JS was chosen so every line is defensible. Data shapes are documented in comments. |
| **Tailwind CSS v4** (`@tailwindcss/vite`) | Responsive variants (`md:`, `lg:`) make "adapt per screen" explicit. Design tokens live in one `@theme` block. |
| **Recharts** | React-native charting; tooltips work on tap (touch-friendly). |
| **Sonner** | Toasts with an action button, e.g. "Pinned · Undo". Emil Kowalski's library, and we have its skill. |
| **Vaul** | Native-feeling, drag-to-dismiss bottom sheet for phone editing. Uses an established library instead of hand-rolled touch gestures. |
| **lucide-react** | Consistent line icons, never emoji. |
| **@fontsource/ibm-plex-sans** | Bundled font, so it works offline and inside the single-file build. |
| **React Router (HashRouter)** | Hash URLs work on GitHub Pages **and** when opening the single HTML file from the zip. |
| **vite-plugin-singlefile** | Second build output: one self-contained `index.html` for the zip. |

**Not used, on purpose:** React Flow (a canvas-first design is the problem the brief warns about), Redux (overkill; Context + `useReducer` is enough), shadcn defaults (generic look), Next.js (no server needed).

## 3. Design direction ("not vibe-coded")

Following `.claude/skills/frontend-design`, the plan avoids the known AI tells: cream background with a terracotta accent, near-black with an acid accent, the SaaS card kit (identical rounded cards, soft shadows, gradients), ALL-CAPS eyebrow labels, `A · B · C` meta strings, `→` on buttons, monospace data labels, and emoji.

- **Principle: "Color means status."** The interface is quiet and neutral. Color appears only where it carries meaning: pipeline status (Succeeded / Running / Failed / Scheduled), and the highlighted series in a chart. A red element on screen always means something needs attention.
- **Signature element: the "pipe".** Pipeline steps are joined by a solid connector that carries the **row count flowing through it** (e.g. `12,480 rows` → filter → `9,302 rows`). It's horizontal on desktop and a vertical spine on iPad and iPhone. This is the one place we spend boldness. Everything else stays disciplined.
- **Type:** IBM Plex Sans, one family. It fits an engineering/data product and has true tabular figures, so KPI numbers line up. A clear type scale using 400/500/600 weights. Sentence case everywhere.
- **Palette:** 5–6 named tokens (cool off-white surface, ink, muted ink, hairline border, one restrained accent for primary actions and focus) plus 4 status colors. All of it is checked for WCAG AA contrast. Exact hex values are finalised and screenshot-reviewed in Phase 1.
- **Hierarchy over boxes.** Group content with spacing and dividers where possible, and use cards only where content is a self-contained object (a chart, a step). Radius and elevation vary by role, not one value everywhere.
- **Copy:** plain, active, specific ("Re-run from this step", "Approve fix"). Errors explain what happened and how to fix it. Toasts reuse the button's verb ("Pin" → "Pinned").
- **Motion:** only in response to the user: sheet open, row-count change, status transition. `prefers-reduced-motion` is respected.
- **Sample data story:** a fictional retail chain, *Halden Outfitters*, with realistic, non-round numbers and timestamps.

## 4. Information architecture & navigation per device

| | iPhone (<768) | iPad (768–1023 / 1024) | Desktop (≥1280, tuned at 1440) |
|---|---|---|---|
| Nav | Bottom tab bar: Chat, Dashboard, Pipelines | Icon rail on the left | Full sidebar with labels |
| Detail editing | Bottom sheet (Vaul) | Side inspector panel (split view) | Side inspector panel |
| Filters | "Filters" button → sheet | Inline segmented controls | Inline segmented controls |

Routes: `#/chat`, `#/dashboard` (+ drill-down `#/dashboard/region/:id`), `#/pipelines`, `#/pipelines/:id`, `#/preview` (device preview page, built last).

## 5. Screens

**Chat**
- Seeded conversation: *"Which regions missed their sales target last quarter?"* → answer card containing a bar chart (actual vs target by region), a 2–3 sentence summary, and a source line ("Data from Regional Sales · updated 2h ago", which opens the pipeline).
- Actions: **Pin to dashboard** (toast with Undo and "View dashboard"), **View as table**, follow-up chips ("Break down by product", "Compare to Q2", "Show as line chart"). The chips swap in pre-written answers, so asking chat to change a chart works without any AI.
- Phone: full-width thread with a sticky composer that respects the safe area. Desktop: centered reading-width thread.

**Dashboard**
- Header: data freshness ("Updated 2h ago") + a **pipeline status strip** showing each feeding pipeline with its status; tap one to open it.
- KPIs (4): desktop in one row; iPad 2×2; **phone: a compact 2×2 grid with the primary KPI emphasised**, not 4 tall stacked cards.
- Charts: desktop 2-column grid; iPad 2-column/1-column; phone single column, priority-ordered.
- Filters: date range + region (inline on desktop/iPad, sheet on phone). Changing them actually changes the data.
- **Drill-down:** tap a region bar → region view (by store / product category) with a back breadcrumb.
- **Stale-data warning (add-on 1):** the chart fed by the failed pipeline shows an inline warning, "Data may be out of date. Regional Sales failed 3h ago", with a **Review fix** button.

**Pipelines list**: name, status, last run, next scheduled run, which dashboards it feeds.

**Pipeline detail (key screen)**
- Example pipeline *Regional Sales*: two sources (`Q3_regional_targets.xlsx`, `sales_orders` warehouse table) → Filter rows → **Join on region** (failed) → Aggregate by region → Calculate variance → Publish to dashboard.
- **Desktop:** left-to-right flow with the two sources merging into the Join; a right-hand inspector for the selected step.
- **iPad:** vertical spine on the left, inspector on the right (split view); portrait and landscape both tuned.
- **iPhone:** vertical spine of step cards (status, rows in → out, duration). The join shows as a "Merges with sales_orders" chip instead of drawn crossing lines. Tap a step → bottom sheet with **Overview / Edit / Run log**.
- **Light edits:** filter condition, join key, schedule. The step's row-count change is previewed **before** saving (add-on 3), e.g. "Rows: 12,480 → 9,302"; saving shows a toast with Undo.
- **Failure explanation + fix (add-on 2):** "The Excel file's `Region` column was renamed to `Sales_Region`, so the join found no matches. Map `Sales_Region` to `Region`?" with **Preview** → **Approve fix** (human approves the AI suggestion).
- **Re-run from this step:** the status goes Running (simulated progress through the remaining steps) → Succeeded; the dashboard's stale warning clears and the freshness updates. This is the end-to-end "trust" story.
- **Run log:** a short history per step (ran, failed, fix approved by M. Yousuf, re-ran).

**Device preview page** (last): iframes at 375 / 820 / 1440, scaled to fit, for reviewers.

## 6. Code structure

```
astera-studio/
  PLAN.md  README.md  NOTE.md  index.html  vite.config.js  package.json
  src/
    main.jsx, App.jsx                 # router + providers (Toaster)
    styles/index.css                  # Tailwind + @theme tokens, base, reduced-motion
    data/                             # single consistent data story
      pipelines.js  metrics.js  chat.js
    state/AppStore.jsx                # Context + useReducer: pins, filters, pipeline/step
                                      # status, applyFix, rerun, undo (with action history)
    hooks/useMediaQuery.js            # choose panel vs sheet, flow vs spine
    components/
      layout/  AppShell, Sidebar, IconRail, TabBar
      ui/      Button, StatusBadge, Freshness, Sheet (Vaul wrapper), SegmentedControl
      charts/  ChartCard, RegionBarChart, TrendLineChart, DataTable, StaleWarning
    features/
      chat/       ChatScreen, AnswerCard, FollowUpChips, Composer
      dashboard/  DashboardScreen, KpiGrid, FilterBar, PipelineStatusStrip, RegionDrilldown
      pipelines/  PipelineList, PipelineDetail, FlowDiagram (desktop), FlowSpine (iPad/phone),
                  StepInspector, StepSheet, FixSuggestion, EditPreview, RunLog
      preview/    DevicePreview
```

Rules: layout changes go in CSS (Tailwind breakpoints) wherever possible, with JS (`useMediaQuery`) only where a *different component* is needed (panel vs sheet, flow vs spine). One store means actions on one screen show up on the others: a fix on the pipeline screen clears the dashboard warning.

**Touch/accessibility floor (from the `mobile-native` and `web-design-guidelines` skills):** ≥44px tap targets; hover styles only inside `@media (hover:hover)`; no tap-highlight flash; `dvh` instead of `100vh`; safe-area insets on the tab bar and composer; inputs ≥16px (no iOS zoom); visible `:focus-visible` rings; semantic buttons/links; status conveyed by icon + text, not color alone; charts have a table alternative.

## 7. Phases (stop and explain after each)

1. **Foundation:** `git init`, Vite + React + Tailwind + dependencies, design tokens, fonts, `AppShell` with all 3 navigation patterns, routing, empty screens. Screenshot review of tokens at 3 sizes.
2. **Data + state:** the Halden Outfitters data story, `AppStore` reducer and actions, shared UI parts (StatusBadge, Freshness, Button, Sheet, ChartCard).
3. **Chat screen:** answer card, pin + undo, source link, view as table, follow-up chips.
4. **Dashboard:** KPIs, charts, status strip, filters, drill-down, stale-data warning.
5. **Pipeline detail:** flow (desktop), spine (iPad/phone), inspector/sheet, edit preview + undo, failure explanation + approve fix, re-run simulation, run log. Pipelines list.
6. **Polish + stress test:** `break-ui` pass (long names, empty states, zero rows), `web-design-guidelines` review, motion polish (`emil-design-eng`), mobile fixes (`mobile-native`), then the device preview page. Dark mode only if everything else is fully polished.
7. **Ship:** production build + single-file build, deploy to GitHub Pages, README (how to run, structure, decisions), one-page NOTE (design ideas, the dropped single-canvas idea, AI tools + key prompts + manual fixes), zip `MuhammadYousuf_FAST-NUCES_2023`.

Commit at the end of each phase with a clear message.

## 8. Verification

- **Screenshots via `webapp-testing` (Playwright)** of every screen at 375×812, 768×1024, 1024×768 and 1440×900. Each layout is reviewed for "adapted, not shrunk".
- **Touch check:** emulate touch (`hasTouch`, `isMobile`) and confirm every action works by tap, with no hover dependence.
- **End-to-end trust flow:** Dashboard stale warning → Review fix → Approve → Re-run → Succeeded → the dashboard warning clears and freshness updates.
- **Console clean:** no errors or warnings (Playwright console logging).
- **Builds:** `npm run build` works on GitHub Pages; the single-file `index.html` opens by double-click from the unzipped folder.
- **Accessibility:** keyboard-only pass (tab order, focus rings, sheet focus trap), colour-contrast check of tokens.
- **Fresh-eyes check:** unzip into a new folder and open it the way a reviewer would.
