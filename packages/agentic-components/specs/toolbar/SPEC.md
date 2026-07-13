---
name: toolbar
platform: react-native (Windows, macOS)
description: Horizontal molecular container that groups icon-only action buttons and dividers into a cohesive control strip, with size-dependent gap spacing and delegated interaction states.
argument-hint: "[size, gap spacing, divider placement, or child button configuration question, e.g. 'which gap token for Small?']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | molecular |
| Component | Toolbar |

This spec covers the Toolbar component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. Toolbar is a **layout-only container** — it owns gap spacing and structural arrangement, but delegates all visual styling (background, foreground, interaction states) to its child Button and Divider sub-components. Do not apply fills, strokes, or typography directly to the toolbar surface.

---

# Toolbar

## Spec

### Dependencies

- **Button** (`flex-components:button`) — Icon only layout, Subtle style. Size matches toolbar Size variant (Large → Large, Small → Small). All interactive states delegated to Button.
- **Divider** (`flex-components:divider`) — Vertical separator between logical button groups.

---

### Anatomy

1. **Container** — auto-layout root frame; horizontal flex with `items-center` alignment. Owns gap spacing between all direct children. No background fill, no stroke, no padding.
2. **Button** — icon-only Subtle Button instances. Each button is a discrete action or toggle within the toolbar. Interaction states (Rest, Hover, Pressed, Disabled, Selected) are owned entirely by the Button sub-component.
3. **Divider** — vertical separator between logical groups of buttons. Uses `--gnrc-color-stroke-neutral-subtle` at `--gnrc-stroke-width-thin`. Stretches to full height of the toolbar container.

| Slot | Required | Default |
|------|----------|---------|
| Button | Yes (at least one) | Icon-only Subtle Button |
| Divider | No | Add between button groups to create logical separation |

---

### Variants

Variant properties are ordered in the design tool: **Size**.

#### Size

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Large** | Uses Large Buttons with `--gnrc-spacing-component-base-150` between children | Default. Standard surfaces and formatting bars. |
| **Small** | Uses Small Buttons with `--gnrc-spacing-component-base-50` between children | Dense surfaces: compact toolbars, inline editors, space-constrained contexts. |

**Why only two sizes:** Toolbar sizes map directly to Button sizes — Large toolbar uses Large buttons, Small toolbar uses Small buttons. Medium is omitted because the toolbar's primary use case is dense formatting controls where Large and Small cover the practical range. The gap token scales proportionally with size.
