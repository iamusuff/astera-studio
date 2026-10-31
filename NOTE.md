# Design note: Astera Studio

**Muhammad Yousuf · FAST-NUCES · Batch 2023** · [Live demo](https://iamusuff.github.io/astera-studio/)

## The main idea: design for trust

A chat answer or a dashboard tile is only as reliable as the pipeline behind it, so I made that link visible everywhere. Every chart names its pipeline and how fresh its data is. When a pipeline fails, the affected numbers say *"Data may be out of date"*, and one tap leads to the failed step. The step explains the failure in plain language, suggests a fix with a preview, and waits for a person to approve it. This follows Astera's governed-AI model: AI proposes, a human approves, the system runs and logs it. Re-running clears the warning on every screen at once.

## Pipeline detail, the hardest screen

- **Desktop:** the full flow left to right. Side inputs (the Excel file) sit below the step they merge into, connectors are drawn from measured box positions, and each line carries the rows that passed through it (`638.9K → 195.4K → 0`). A broken step is easy to spot without reading anything.
- **iPad and iPhone:** a vertical *spine* instead of a canvas. Most real pipelines are one chain with a few side inputs, so a merge becomes a **"Merges with Q3_regional_targets.xlsx"** chip on the step instead of crossing lines. On iPad the step's details open beside the spine; on iPhone they open in a bottom sheet with *Details / Edit / Run log*.
- **Safe edits on a phone:** the filter step previews its effect (*195,436 → 209,651 rows*) before you save. Changes apply on the next run, and fixes, edits and pins can all be undone.

Other choices: color means status (red only when something needs attention); Apple's patterns per device (tab bar, sidebar, sheets, large titles) so each layout adapts instead of shrinking; no hover-only interactions; light and dark mode with *Reduce motion* and *Reduce transparency* respected.

## An idea I dropped

**One pan-and-zoom canvas for every device**, like a desktop ETL designer. It looked consistent, but on a 375 px phone you would spend the whole time pinching and dragging to read one step name, and tapping a node accurately is hard. The spine shows the same structure and stays usable with a thumb, so the canvas lives only where there's room for it.

## How I used AI

**Tool:** Claude Code (Anthropic's Claude) as a pair programmer, with installed design and testing skills (frontend design, mobile web, accessibility review, Playwright testing).

**Key prompts (shortened):**

1. *"Act as an extremely senior developer. I can make mistakes or be wrong, so point them out, and tell me the decisions you make and why."*
2. *"I want the website to feel like an iOS application: smoothness, a clever layout, a premium look. Choose the theme wisely."*
3. *"Check the whole flow now, not just the UI: the system parts like pipeline fixes, and tell me what the next steps should be."*

**What I changed and corrected myself:**

- I rejected the first interface as too plain and pushed it toward a native iOS feel.
- I called out details that looked machine-made: generic icons, rainbow icon tiles and colored status dots in the sidebar. These became one consistent icon set and calm, single-color tiles, with color only for failures.
- I spotted the chat page not widening when the sidebar closed, and the empty pipeline rows in the sidebar.
- I asked for a review of the logic, not just the looks. It found an Undo bug that could leave a pipeline stuck on "Running" and an edited filter being skipped on re-run. Both are now fixed.
- I chose plain JavaScript over TypeScript so I can explain every line.
