---
component: ProgressBar
platform: react-native (Windows, macOS)
---

# ProgressBar Interaction (React Native — Windows & macOS)

## Keyboard navigation

None — ProgressBar is not interactive and is not part of the tab order. It does not receive focus.

## Focus management

None — ProgressBar does not receive or manage focus. It has no focus ring.

## Animation

ProgressBar's three Types each have distinct animation behavior:

- **Determinate** — Indicator width transitions between values via CSS `transition: width 200ms ease-out`. Each value update animates from the prior width to the new width. Ease-out lets the bar arrive at its target without overshoot and reads as "settling into place."
- **Indeterminate** — Continuous loop animation. The Indicator is a fixed-width segment (~30–40% of Track width) that translates from start to end of the Track on an infinite ~2s linear cycle. Width is constant; only horizontal position changes. The loop must not pause between cycles.
- **Static** — No animation under any circumstance. Width changes from a value update snap to the new width with no transition. Animating a Static change reframes it as Determinate progress, which it is not.

> **Reduced motion (the OS reduce-motion setting):**
> - **Determinate** — Value transitions become instant (`transition: none` on Indicator width). The bar still updates to the correct value; only the animation between values is removed.
> - **Indeterminate** — The continuous loop animation is removed entirely. The Indicator renders as a static neutral fill at a fixed position (or as a fully-filled Track with reduced opacity, depending on implementation). The ARIA semantics declared in `accessibility.md` carry the "work in flight" meaning instead of the visual loop.
> - **Static** — Already has no animation. No change.

## Determinate vs Indeterminate switching

When a task that began with unknown duration becomes calculable (i.e. Indeterminate → Determinate), do not crossfade between the two animations. Snap the Indicator to the calculated value's width on the first Determinate frame, then resume normal value-transition animation from that point forward. Crossfading creates a brief "backward" appearance as the looping segment shrinks back toward the start.

## Long-running indeterminate bars

For tasks that exceed ~5 seconds in Indeterminate, surrounding UI should provide a pause / cancel control where feasible — see `accessibility.md` for the applicable WCAG criterion. The progress bar itself does not own the cancel affordance.
