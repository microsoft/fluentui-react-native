---
component: Scrollbar
---

# Scrollbar Usage

## When to Use

- When a container's content exceeds the viewport along one axis and the user needs a position indicator that reflects how much content sits above/below (or before/after) the current scroll offset.
- When a long-form reading surface, code block, or data table is windowed within a fixed-size region and the overflow is genuinely necessary.
- When the design calls for an unobtrusive, overlay-style scroll indicator that visually defers to content at rest and stays out of the way until scrolling occurs.

### vs ProgressBar

ProgressBar communicates **discrete progress** through a task or download — it answers "how much of this is done?" Scrollbar communicates **continuous scroll position** within an overflowing container — it answers "where am I in this content?" The routing signal: ProgressBar's fill is monotonic and represents work completed against a known total; Scrollbar's thumb is bidirectional and represents the viewport's location within scrollable content. Use ProgressBar when there is a defined end state to converge on; use Scrollbar for live scroll feedback.

### vs Pagination

Pagination splits content into **discrete pages** the user navigates between via click — the indicator names the current page and offers links to others. Scrollbar treats content as a **single continuous scrollable region** the user moves through via wheel, drag, or keyboard scroll keys. The routing signal: if movement between content is page-by-page and triggered by clicking a control, use Pagination; if movement is continuous and driven by scroll input on the region itself, use Scrollbar.

### When NOT to Use

- Do not render a Scrollbar when content fits within the viewport. The thumb should hide entirely when there is nothing to scroll — a thumb at full extent against an empty track is visual noise.
- Do not pair the Scrollbar with a custom keyboard or wheel handler that bypasses the native scroll machinery. Replacing native behavior breaks platform conventions and accessibility tooling.

---

## Behavior

- **Do not throttle the thumb's position or length updates behind animation frames.** The thumb tracks the live scroll offset one-to-one — geometry is described in the Spec anatomy and must not be smoothed or lagged.
- **The Scrollbar must not steal pointer events from the content.** Pointer input over the thumb engages drag-to-scroll; pointer input over the implicit track region passes through to the underlying content unless the platform's native scrollbar pseudo-element claims the click. Do not overlay a transparent hit-target across the entire track.
- **Prefer vertical reflow over horizontal scroll.** Horizontal scroll is harder to discover and harder to navigate by keyboard — only reach for a Horizontal Scrollbar when the content is inherently wide (tables, image strips, code) and reflow is impossible.

---

## Layout

- **Only one Scrollbar per axis per container.** Nested scroll containers each render their own Scrollbar, but a single container must not show two parallel thumbs along the same axis.
