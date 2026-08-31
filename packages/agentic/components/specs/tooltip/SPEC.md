---
name: tooltip
platform: react-native (Windows, macOS)
description: Non-interactive contextual label that surfaces a brief description of an adjacent UI element on hover or focus. Single style, four positioning directions (runtime, not Figma variants).
argument-hint: "[variant axis or behavior question, e.g. 'positioning tokens' or 'aria-describedby pattern']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value   |
| --------- | ------- |
| Type      | atomic  |
| Component | Tooltip |

This spec covers the Tooltip component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (show/hide, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is putting interactive content or rich markup inside a tooltip — Tooltip is a read-only label, not a popover. Never use Tooltip to communicate critical or required information; it is an enhancement, not a primary affordance.

---

# Tooltip

## Spec

### Anatomy

1. **Container** — auto-layout root frame; owns the surface fill, border radius, padding, and shadow. Not interactive.
2. **Label** — text node bound to the `tooltipString` component property; single line; always functional type.

| Slot  | Required | Default        |
| ----- | -------- | -------------- |
| Label | Yes      | "Capabilities" |

---

### Variants

Tooltip has no Figma variant axes. Positioning is a runtime/code concern and is not modeled as a variant.
