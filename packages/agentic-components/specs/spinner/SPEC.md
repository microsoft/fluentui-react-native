---
name: spinner
platform: react-native (Windows, macOS)
description: Atomic non-interactive indeterminate progress indicator — a continuously rotating arc on a low-emphasis ring. Single variant axis (Size) across eight steps from inline-with-text (16px) to focal-element (44px).
argument-hint: "[e.g. 'which size for inline text', 'reduced-motion behavior', 'vs Skeleton']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | Spinner |

This spec covers the Spinner component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (animation, reduced motion) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is reaching for Spinner when the incoming content's layout is already known — at that point Skeleton is the honest signal, because it tells the user what is about to appear. Spinner says only "something is happening" and earns its keep in short, indeterminate waits or in regions too small to mimic structure.

---

# Spinner

## Spec

### Anatomy

1. **Track ring** — full-circumference circular stroke at low-emphasis color. Establishes the diameter and reads as the recessed background of the spin.
2. **Indicator arc** — partial-arc stroke at high-emphasis color, overlaid on the track. Covers **approximately 25% of the circumference (one quarter turn) at every size** — the visible fraction is a design constant, not a function of diameter, so the rotation reads identically across the size range. Rotates continuously around the shared center to communicate motion.

The two strokes share an identical diameter, stroke width, circular shape, and rotation center. Visual distinction is color only — track uses the subtle neutral stroke, indicator uses the loud neutral stroke. There are no text slots, no icon slots, and no boolean toggles on the component itself; adjacent status text is composed outside the spinner.

---

### Variants

Variant properties are ordered in the design tool: **Size**.

#### Size

| Value | Diameter | Stroke width | When to Use |
|-------|----------|--------------|-------------|
| **X-Tiny** | 16px | `--gnrc-stroke-width-thin` | Embedded inline next to body text — inside a message bar, list item, or input field. |
| **Tiny** | 20px | `--gnrc-stroke-width-thin` | Inline with a Small Button or Small Input. |
| **X-Small** | 24px | `--gnrc-stroke-width-thin` | Inline with a Medium Button or Medium Input. |
| **Small** | 28px | `--gnrc-stroke-width-thick` | Inline with a Large Button or Large Input. Standalone in compact regions. |
| **Medium** | 32px | `--gnrc-stroke-width-thick` | Default for standalone spinners that occupy their own region. |
| **Large** | 36px | `--gnrc-stroke-width-thicker` | Empty-state regions, modal dialogs, or large empty containers. |
| **X-Large** | 40px | `--gnrc-stroke-width-thicker` | Full-page spinner inside an overlay or hero section. |
| **Huge** | 44px | `--gnrc-stroke-width-thicker` | Marketing or onboarding contexts where the spinner is the focal element. |

**Why eight steps:** Spinner is the only loading signal for regions too small for Skeleton. Eight steps span from inline-with-text (16px) to focal-element (44px) so the indicator can scale with its host control rather than appearing under- or over-sized. Stroke width steps with the size group — `thin` up to 24px, `thick` at 28–32px, `thicker` at 36–44px — so the arc remains perceptible at every diameter without dominating small embeds.

**Why no Appearance axis:** Track and indicator both bind to neutral stroke tokens (`--gnrc-color-stroke-neutral-subtle` and `--gnrc-color-stroke-neutral-loud`), which the theme layer remaps when the spinner sits on a colored or inverted surface. An explicit Inverted axis would duplicate what theming already does and would have to be threaded through every Spinner consumer manually.

**Why no States:** Spinner is non-interactive — there is no hover, pressed, focus, or disabled state. The component exists in a single, always-spinning visual state at rest; reduced-motion handling lives in `interaction.md` and the `motion` block in `tokens.yaml`, not as a State variant.
