---
component: Tab
platform: react-native (Windows, macOS)
---

# Tab Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus into and out of the parent Tablist as a group.
- **Arrow Left / Arrow Right** — moves focus between tabs within the Tablist (roving tabindex, managed by Tablist).
- **Enter / Space** — activates the focused tab, setting Selected=True and deselecting all siblings.
- **Home / End** — moves focus to the first or last tab in the Tablist.

## Focus management

Tab does not manage its own focus — focus is managed by the parent Tablist via roving tabindex. Only one tab within the Tablist is in the tab order at any time. The Focus ring is rendered on the Tab container when it receives keyboard focus.

## Animation

State transitions (Rest → Hover, Selected swap) are platform-driven color transitions. Duration and easing reference motion tokens once defined.

> **Reduced motion:** When the OS reduce-motion setting is set, all transitions should be instant (duration 0ms). No scale, translate, or opacity animation is used — color-only transitions should still be removed when reduced motion is active.
