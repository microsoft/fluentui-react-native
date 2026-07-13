---
name: menu
platform: react-native (Windows, macOS)
description: Composed overlay surface that presents a list of actions or options. Wraps a Popover instance and fills its Content Slot with MenuItem and Section Header children. Inherits container tokens (surface, stroke, radius, shadow, elevation) from Popover and overrides only padding. Provides keyboard navigation, focus management, and ARIA menu context.
argument-hint: "[container token question or behavior question, e.g. 'padding override' or 'keyboard navigation pattern' or 'submenu positioning']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | composed |
| Component | Menu |

This spec covers the Menu component — the composed container surface. For individual item tokens and variant definitions, see `flex-components:menu-item`. React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, open/close, submenu) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most important principle: Menu is an overlay surface, not an inline content area. It appears on user action (click, right-click, keyboard shortcut) and dismisses when an action is taken or focus leaves.

---

# Menu

## Spec

### Dependencies

- **Popover** (`flex-components:popover`) — provides Menu's container surface. The Menu symbol wraps a Popover instance and fills its native Content Slot with menu items. All container tokens (surface fill, stroke, radius, shadow, elevation) are inherited from Popover. Menu overrides Popover's container padding — see `tokens.yaml`. Positioning and submenu anchoring also follow Popover § Positioning.
- **MenuItem** (`flex-components:menu-item`) — List Item and Section Header children. Owns all item-level tokens, interaction states, and typography.
- **Divider** (`flex-components:divider`) — optional visual separator between grouped items. Uses Divider's own tokens — Menu does not override any Divider styling.

---

### Anatomy

1. **Popover surface** — the container is a Popover instance (`flex-components:popover`). It owns the surface fill, stroke, radius, shadow, and elevation; Menu overrides only the container padding. Renders as an overlay positioned relative to a trigger element.
2. **Content Slot** — Figma native slot exposed by Popover; holds the menu's children in document order. Section Headers, List Items, and Dividers all live here.
3. **Section Headers** — optional non-interactive group labels (MenuItem with Style=Section Header). Organizes related items within the menu.
4. **List Items** — interactive MenuItem instances (Style=List Item). The primary content of the menu.
5. **Dividers** — optional visual separators between groups of items.

| Slot | Required | Default | Accepts |
|------|----------|---------|---------|
| Content Slot | Yes | MenuItem instances | MenuItem (Section Header / List Item), Divider |

> **Figma symbol width:** The Menu symbol is fixed at 240px in Figma for legibility in the library — it is not a hard sizing rule. At runtime, Menu width is determined by content and stretches to fit the widest item.

---

### Variants

Menu has no variants.
