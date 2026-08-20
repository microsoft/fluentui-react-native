---
name: divider
platform: react-native (Windows, macOS)
description: Non-interactive visual separator that groups sections of content to create rhythm and hierarchy. Covers orientation (horizontal/vertical), label alignment (Center/Start/End), optional icon slot, and label visibility.
argument-hint: "[variant axis or token question, e.g. 'vertical divider tokens' or 'label alignment options']"
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

## Metadata

| Field     | Value   |
| --------- | ------- |
| Type      | atomic  |
| Component | Divider |

This spec covers the Divider component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance is in `interaction.md`, React Native accessibility guidance is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is reaching for a Divider when spacing alone would suffice — a Divider is a visible stroke that explicitly separates content groups, not a substitute for gap or padding. Use spacing and typographic hierarchy first; add a Divider only when the boundary between sections needs visual reinforcement.

---

# Divider

## Spec

### Anatomy

1. **Divider line (before)** — flex-grow stroke element that precedes the content container. In Center layout, grows equally with the trailing line. In Start layout, it becomes the short stub near the start edge.
2. **Content container** — private auto-layout frame holding icon and label. Owns internal gap and padding. Hidden when both label and icon are hidden, collapsing the component to a plain line.
3. **Icon** — optional Fluent Iconography instance (20px, Regular theme). Hidden by default.
4. **Label** — optional text node bound to the label slot. Uses `textstyle-functional-body-small` in secondary foreground color.
5. **Divider line (after)** — flex-grow stroke element that follows the content container. In Center layout, grows equally with the leading line. In End layout, it becomes the short stub near the end edge.

| Slot  | Required | Default |
| ----- | -------- | ------- |
| Label | No       | Visible |
| Icon  | No       | Hidden  |

> **Content visibility:** Hiding both icon and label collapses the content container, leaving only the divider line. This is equivalent to the "No text" presentation shown in the speclet.

---

### Variants

Variant properties are ordered in the design tool: **Layout → Vertical**.

#### Layout

| Value                | Description                                                                                  | When to Use                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Center (Default)** | Content is centered between two equal flex-grow lines                                        | Default. Use when the label should sit at the midpoint of the divider.                   |
| **Start**            | Content is positioned near the start edge; leading line is a `spacing.componentBase100` stub | When the label should read left-aligned (LTR) or right-aligned (RTL) within the divider. |
| **End**              | Content is positioned near the end edge; trailing line is a `spacing.componentBase100` stub  | When the label should appear at the far edge of the divider.                             |

**Why Layout is a variant axis:** The position of the content fundamentally changes the flex behavior of the two line segments — Center uses two equal flex-grow lines, while Start and End use a fixed stub on one side. This structural difference cannot be achieved by toggling a property on a single layout configuration.

#### Vertical

| Value     | Description                                                            | When to Use                                                                               |
| --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **False** | Horizontal orientation; line runs left to right, fills available width | Default. Use for most content separation — between sections, list groups, or form blocks. |
| **True**  | Vertical orientation; line runs top to bottom, fills available height  | Use for side-by-side column separators, panel edges, or inline vertical breaks.           |

**Why Vertical is a variant axis, not a property:** Switching orientation changes the flex direction of the root container and swaps which axis the line and padding expand along — a structural layout change, not a style toggle.
