---
component: Checkbox
platform: react-native (Windows, macOS)
---

# Checkbox Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus to and from the checkbox.
- **Space** — toggles the checkbox status (Unchecked ↔ Checked). Does not use Enter — this follows native HTML checkbox behavior.
- In a checkbox group, each checkbox is an independent tab stop (not arrow-key navigable like radio groups).

## Focus management

Focus follows standard platform behavior. Checkbox does not trap focus or manage programmatic focus placement. The focus ring wraps the entire interactive area (indicator + label), not just the indicator.

## Animation

Status transitions (Unchecked → Checked) may include a brief checkmark reveal animation. State transitions (Rest → Hover) are platform-driven color transitions.

> **Reduced motion:** When the OS reduce-motion setting is set, all transitions should be instant (duration 0ms). No scale, translate, or opacity animation.
