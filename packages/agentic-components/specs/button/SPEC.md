---
name: button
platform: react-native (Windows, macOS)
description: Atomic interactive control that triggers a discrete action. Covers style hierarchy (Primary/Secondary/Outline/Subtle), layout modes (Icon and text/Icon only), three sizes, Selected toggle axis, and the font-weight swap pattern used for Selected labels.
argument-hint: "[variant axis or token question, e.g. 'Primary hover token' or 'icon-only accessibility']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | Button |

This spec covers the Button component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is reaching for Primary when Secondary or Subtle is correct — Primary is reserved for the single loudest action on a surface, not every clickable element. The Selected axis makes Button a toggle; do not use Disabled to simulate a toggled state.

---

# Button

## Spec

### Anatomy

1. **Container** — auto-layout root frame; owns all padding, border radius, background fill, and stroke.
2. **Icon** — optional Fluent Iconography instance (Regular theme at rest; Filled theme when Selected=True). Hidden by default.
3. **Label** — text node bound to the `Label string` component property. Uses the font-weight swap pattern: a ghost Semibold node reserves layout width, a visible Regular or Semibold node renders on top.

| Slot | Required | Default |
|------|----------|---------|
| Label | Yes (Icon and text layout) | "Button" |
| Icon | No | Hidden |

> **Font-weight swap:** In Icon and text layout, the label changes weight between Selected=False (Regular) and Selected=True (Semibold). The ghost node is always Semibold at opacity 0 to prevent layout reflow on selection. The visible node is absolutely positioned over the ghost.

---

### Variants

Variant properties are ordered in the design tool: **Layout → Style → Size → State → Selected**.

#### Layout

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Icon and text** | Icon slot + label side by side | Default for most actions — label improves discoverability |
| **Icon only** | Icon slot alone, centered, no label | Space-constrained contexts where the icon is self-explanatory |

**Why Icon only is a Layout variant, not a separate component:** Removing the label fundamentally changes the container shape, padding calculation, and minimum tap target — it is not equivalent to hiding a text prop. A Layout variant ensures tokens, spacing, and the focus ring are all recalculated correctly for the new form factor.

#### Style

| Value | When to Use |
|-------|-------------|
| **Primary** | The single highest-emphasis action on a surface. |
| **Secondary** | Default for most actions — visually grounded without dominating. |
| **Outline** | Containment with minimal fill weight — often alongside Primary. |
| **Subtle** | Low-emphasis actions, inline controls, and secondary toolbar items. |

#### Size

| Value | When to Use |
|-------|-------------|
| **Small** | Dense surfaces: toolbars, inline controls, data-table rows |
| **Medium** | Default. General-purpose across all surfaces. |
| **Large** | High-touch surfaces, prominent CTAs, or contexts requiring larger tap targets |

**Why three sizes share the same style tokens:** Size changes spacing and typography scale only — not semantic meaning. Using the same background and foreground tokens across sizes ensures a Primary Medium and a Primary Large carry identical visual weight per their context.
