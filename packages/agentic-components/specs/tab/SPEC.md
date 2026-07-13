---
name: tab
platform: react-native (Windows, macOS)
description: Atomic interactive toggle element within a tablist that switches between content panels. Covers Layout (Icon + label, Icon only), Selected toggle axis, font-weight swap pattern, and icon fill swap (Regular → Filled).
argument-hint: "[variant axis or behavior question, e.g. 'what tokens change when Selected=True?']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value  |
| --------- | ------ |
| Type      | atomic |
| Component | Tab    |

This spec covers the Tab component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. Tab has a single implicit Subtle style — there is no Style variant axis. The visual distinction between active and inactive tabs is driven entirely by the Selected axis, which swaps background from transparent to heavy and shifts label weight from Regular to Semibold. Do not attempt to apply Button-style hierarchy (Primary, Secondary) to Tab.

---

# Tab

## Spec

### Anatomy

1. **Container** — auto-layout root frame; owns padding, border radius, background fill. No stroke.
2. **Icon** — optional Fluent Iconography instance (Regular theme at rest; Filled theme when Selected=True). Hidden by default.
3. **Label** — text node bound to the `Tab string` component property. Uses the font-weight swap pattern: a ghost Semibold node reserves layout width, a visible Regular or Semibold node renders on top.
4. **Focus ring** — dual-outline overlay controlled by the system focus ring pattern. Absolutely positioned over the container.

| Slot  | Required                  | Default |
| ----- | ------------------------- | ------- |
| Label | Yes (Icon + label layout) | "Tab"   |
| Icon  | No                        | Hidden  |

> **Font-weight swap:** In Icon + label layout, the label changes weight between Selected=False (Regular) and Selected=True (Semibold). The ghost node is always Semibold at opacity 0 to prevent layout reflow on selection. The visible node is absolutely positioned over the ghost.

---

### Variants

Variant properties are ordered in the design tool: **Layout → State → Selected**.

#### Layout

| Value            | Description                         | When to Use                                                   |
| ---------------- | ----------------------------------- | ------------------------------------------------------------- |
| **Icon + label** | Icon slot + label side by side      | Default — label improves discoverability                      |
| **Icon only**    | Icon slot alone, centered, no label | Space-constrained contexts where the icon is self-explanatory |

**Why Icon only is a Layout variant, not a hidden label:** Removing the label changes the container shape from rounded-rectangle to circular, recalculates padding to squared, and requires `aria-label` for accessibility. A Layout variant ensures tokens, spacing, and the focus ring are all recalculated correctly for the new form factor.

#### Selected

| Value     | Description                                                | When to Use                            |
| --------- | ---------------------------------------------------------- | -------------------------------------- |
| **false** | Transparent background, Regular weight label, Regular icon | Inactive tab — content panel is hidden |
| **true**  | Heavy background, Semibold weight label, Filled icon       | Active tab — content panel is visible  |

**Why Selected drives all visual distinction:** Tab has no Style axis — there is only one visual style. The entire active/inactive distinction is encoded in the Selected axis, which simultaneously swaps background fill, foreground color, label weight, and icon style. This is consistent with the Button Selected pattern but without the style multiplier.
