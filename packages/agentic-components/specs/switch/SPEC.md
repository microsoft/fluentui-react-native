---
name: switch
platform: react-native (Windows, macOS)
description: Atomic interactive toggle control for binary on/off choices that take effect immediately.
argument-hint: "[variant axis or behavior question, e.g. 'when to use Switch vs Checkbox']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | Switch |

This spec covers the Switch component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The track background is transparent when unchecked (gains opacity on hover/pressed via alpha shift) and heavy when checked (shifts lightness inversely on hover/pressed). All three categories — background, foreground, and stroke — participate in interaction states.

---

# Switch

## Spec

### Anatomy

1. **Track** — Two nested layers: an outer hit-area surface and an inner pill. The **hit-area surface** carries `role="switch"`, `aria-checked`, `tabindex`, and the focus ring — it includes the tappable padding and is the focusable element. The **inner pill** is the visible shape — it carries the border, background fill, border-radius, and thumb. The hit-area padding is transparent and must not inflate the pill's stroke or fill. Labels are siblings outside this element, linked via `aria-labelledby`.
2. **Thumb** — The circular indicator that slides between the start (unchecked) and end (checked) positions within the track. The thumb sits with equal breathing room from the inner stroke on every side at each rest position; see `sizes.Default.inset-rule` in `tokens.yaml` for the formula and the cross-axis symmetry rule.
3. **Label Before** — Optional text positioned before (left of) the switch in horizontal layouts.
4. **Label After** — Optional text positioned after (right of) the switch in horizontal layouts.
5. **Label Above** — Optional text positioned above the switch in vertical layout.

| Slot | Required | Default |
|------|----------|---------|
| Track | Yes | — |
| Thumb | Yes | — |
| Label Before | No | Hidden |
| Label After | No | Hidden |
| Label Above | No | Hidden |

---

### Variants

Variant properties are ordered in the design tool: **Layout → Checked → State**.

#### Layout

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Switch** | Standalone switch with no label | When surrounding context (heading, field label) provides enough identification |
| **Horizontal** | Switch with inline label(s) before and/or after | Default for most form settings — label identifies the control |
| **Vertical** | Switch with a label above | Compact layouts where horizontal space is constrained or a top-aligned label is preferred |

**Why three layouts:** Label placement is a structural decision that affects hit target, reading flow, and layout density. Separating it as a variant avoids mixing label-position logic with visual state logic.

#### Checked

| Value | Description | When to Use |
|-------|-------------|-------------|
| **False** | Unchecked — track is transparent, thumb rests at start | Default initial state |
| **True** | Checked — track is filled (heavy), thumb moves to end | Active / enabled state |

**Why checked drives track color:** The transparent/filled track is the primary visual signifier of on vs off. The unchecked track is invisible at rest — the stroke alone defines the control boundary. On hover/pressed, the transparent background gains opacity (alpha shift), providing interaction feedback without suggesting a checked state.

#### State

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Rest** | Default idle appearance | No user interaction |
| **Hover** | Background, thumb, and stroke shift via OKLCH | Pointer is over the switch |
| **Pressed** | Stronger background, thumb, and stroke shift | Active pointer down |
| **Focus** | Dual-outline focus ring on the switch (excluding label) | Keyboard focus |
| **Disabled** | Reduced-contrast track and thumb; non-interactive | Setting is unavailable or locked |

**Interaction model:** All three categories (background, foreground, stroke) participate in hover/pressed. The unchecked transparent background uses alpha shift; the checked heavy background uses inverse lightness shift.
