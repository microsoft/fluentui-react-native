---
name: popover
platform: react-native (Windows, macOS)
description: Atomic floating surface that presents structured, optionally interactive content anchored to a trigger element. Single type (Default), runtime positioning, content swap slot, optional arrow, and light-dismiss behavior.
argument-hint: "[variant axis or behavior question, e.g. 'arrow positioning' or 'light dismiss pattern']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value   |
| --------- | ------- |
| Type      | atomic  |
| Component | Popover |

This spec covers the Popover component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (show/hide, focus, positioning, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is using a Popover when a Tooltip or Dialog would be more appropriate. Popover is for nonessential, contextual information that may include interactive controls — use Tooltip for plain-text labels and Dialog when blocking interaction is required. A popover is a small floating surface that appears when someone interacts with a trigger element, presenting nonessential, contextual information without blocking the underlying page. Popovers can contain structured content and interactive components — headings, lists, form controls, and action buttons — anchored to the trigger with optional arrow continuity.

---

# Popover

## Spec

### Anatomy

1. **Container** — auto-layout root frame; owns the surface fill, border radius, padding, shadow, and subtle neutral stroke. Holds an instance-swap content placeholder — replace it with your content. Not interactive itself; interaction is managed by the trigger and the content within.
2. **Arrow** — optional caret element pointing toward the trigger. Position is determined at runtime to align with the trigger's center edge. Shares the container's surface fill so it appears continuous.

| Slot    | Required | Default             |
| ------- | -------- | ------------------- |
| Content | Yes      | Content placeholder |
| Arrow   | No       | Hidden              |

> **Arrow continuity:** The arrow must read as a seamless extension of the container — matching its surface fill. A consistent shadow around the full popover shape (container + arrow) is recommended where the platform allows, but shadow compositing is an implementation concern, not a strict design requirement. Arrow visibility and direction are runtime concerns; the design implementation includes the arrow as a swappable sub-component, not a variant axis.

---

### Variants

Popover has a single variant axis in Figma.

#### Type

| Value       | Description                                      | When to Use                            |
| ----------- | ------------------------------------------------ | -------------------------------------- |
| **Default** | Standard popover surface with content swap slot. | All use cases — this is the only type. |

> **Positioning** is a **runtime/code concern** — it is not modeled as a design variant axis. The design component is a single symbol; anchor-relative placement (above, below, left, right, and alignment along the anchor edge) is applied by the consuming code at render time, with automatic flip when the popover would overflow the viewport.

#### States

The popover surface itself has no interactive states — it is a passive container. Hover, pressed, focus, and disabled states belong to the trigger element and to any interactive content inside the container, which use their own component interaction tokens.

| State       | Visual                                       | Token behavior                      |
| ----------- | -------------------------------------------- | ----------------------------------- |
| **Visible** | Surface, shadow, and optional arrow rendered | All container tokens at rest values |
| **Hidden**  | Not rendered                                 | —                                   |

> **Why no hover/pressed/disabled?** The popover container is not interactive. Interaction states are scoped to the trigger (which owns `aria-expanded`) and to child components inside the container (buttons, links, etc.), each of which carries its own state tokens.
