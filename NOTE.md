# Design note: Astera Studio

**Muhammad Yousuf · FAST-NUCES · Batch 2023** · [Live demo](https://iamusuff.github.io/astera-studio/) · [Code](https://github.com/iamusuff/astera-studio)

## The bet: an analytics tool is only as good as the trust you can place in it

Charts usually hide the pipelines behind them, so when one breaks, people keep deciding on stale numbers. Astera Studio keeps that link visible at every level. Each chart names its pipeline and how fresh its data is. A failure flags *only* the numbers it affects and leads, in one tap, to the failed step. There, the cause is explained in plain language (*Sara in Finance renamed `Region` to `Sales_Region`*) with a suggested fix, a preview, and an **Approve** button. It mirrors Astera's governed-AI model: **AI proposes, a person approves, the system runs and logs.** One re-run clears the warning on every screen, because every screen reads from the same state.

## The pipeline screen: one structure, three ways to read it

- **Desktop:** the full flow, left to right. Side inputs sit under the step they feed. Connectors are drawn from measured positions and carry the rows that passed through (`638.9K → 195.4K → 0`), so the break is visible before you read a word.
- **iPad and iPhone:** a vertical **spine**. Most pipelines are one chain with a few side inputs, so a merge becomes a *"Merges with Q3_regional_targets.xlsx"* chip instead of crossing lines. Details open beside the spine on iPad and in a bottom sheet on iPhone.
- **Safe edits from a phone:** a filter change previews its effect (*195,436 → 209,651 rows*) before saving. It applies on the next run, and fixes, edits and pins can all be undone.

**The idea I dropped:** a single pan-and-zoom canvas on every device, like a desktop ETL designer. It looked consistent, but at 375 px you'd pinch and drag just to read one step name. The spine shows the same graph and works with a thumb, so the canvas lives only where there's room for it.

**Checked, not assumed:** tested on 4 viewport sizes · 0 axe-core accessibility violations in light and dark · 17 automated checks that every screen's numbers agree · works by touch and keyboard, with no hover-only actions.

## How I worked with AI

**Tool:** Claude Code (Anthropic) as a pair programmer, with design, mobile-web, accessibility and Playwright testing skills installed. I set direction and reviewed every phase; it wrote and tested code.

**Three prompts that shaped the result:**

1. *"Act as a principal engineer reviewing my work, not an assistant agreeing with it: challenge my assumptions, point out my mistakes, and justify each decision before you build it."*
2. *"Hold the interface to Apple's standards: every device gets the layout native to it, motion feels physical, and color is used only where it means something."*
3. *"Stop polishing the screens and audit the system: walk through every pipeline state (fail, fix, re-run, undo, reset) and find any moment where the app could tell the user something untrue."* This found an Undo that could leave a pipeline stuck on "Running", and a re-run that skipped an edited filter. Both are fixed.

**Small decisions I made by hand:**

- **Warn only where the data is wrong.** Revenue, orders and order value carry a warning icon, but return rate doesn't, because it comes from a different, healthy pipeline.
- **Say what is still true, not just what broke:** *"Last good data yesterday, 6:05 AM"* instead of a bare *Failed*.
- **Numbers that don't wobble:** tabular figures, so digits keep their width while KPIs animate, and a true minus sign (−), so *+2.2%* and *−8.0%* line up.
- **Quiet by default:** healthy pipelines in the sidebar show only *"2h"*. Only a failure or a run in progress earns an icon, so problems stand out.
- **Show who it's for:** the line under my name shows a role, *Sales analyst*, not the company. The person fixing this pipeline is a business user, not an engineer.
