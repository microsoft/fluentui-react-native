---
name: tablist
platform: react-native (Windows, macOS)
description: Horizontal molecular container that groups Tab components into a navigation strip for switching between content views, with gap spacing, roving tabindex, and an optional end-content action slot.
argument-hint: "[gap spacing, end content, keyboard navigation, or tab configuration question, e.g. 'how does roving tabindex work?']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | molecular |
| Component | Tablist |

This spec covers the Tablist component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, activation strategies) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. Tablist is a **layout-only container** — it owns gap spacing, keyboard navigation, and structural arrangement, but delegates all visual styling (background, foreground, interaction states) to its child Tab sub-components. Do not apply fills, strokes, or typography directly to the Tablist surface.

---

# Tablist

## Spec

### Dependencies

- **Tab** (`flex-components:tab`) — Primary child component. Layout (Icon + label, Icon only) and Selected state are configured per Tab instance. All visual styling and interaction states are owned by Tab.
- **Button** (`flex-components:button`) — Icon only layout, Subtle style. Used in the optional end-content slot for actions like overflow or add-tab.

---

### Anatomy

1. **Container** — auto-layout root frame; horizontal flex with `items-start` alignment. Owns gap spacing between all direct children. No background fill, no stroke, no padding.
2. **Tab** — Tab instances as direct children. One tab must always be Selected=True. The Layout of individual tabs (Icon + label or Icon only) is configured per instance, though all tabs within a single Tablist typically share the same layout.
3. **End content** — optional trailing slot that flexes to fill remaining width and aligns its content to the trailing edge. Contains an icon-only Subtle Button for actions like overflow or add-tab.

| Slot | Required | Default |
|------|----------|---------|
| Tab | Yes (at least two) | Tab with Selected=False |
| End content | No | Hidden |

---

### Variants

Tablist has no variant properties of its own — child Tab components carry Layout, State, and Selected variants. The Tablist surface exposes only the End content boolean.
