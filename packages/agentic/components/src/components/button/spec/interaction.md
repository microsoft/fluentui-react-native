---
component: Button
platform: react-native (Windows, macOS)
---

# Button Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus to and from the button.
- **Enter / Space** — activates the button (fires the action or toggles Selected state).
- No arrow key navigation — Button is a single focusable element, not part of a composite widget.

## Focus management

Focus follows standard platform behavior. Button does not trap focus or manage programmatic focus placement.

## Animation

State transitions (Rest → Hover, Rest → Pressed) are platform-driven color transitions. Duration and easing reference motion tokens once defined.

> **Reduced motion:** When the OS reduce-motion setting is set, all transitions should be instant (duration 0ms or near-0ms). No scale, translate, or opacity animation is used on Button — color-only transitions are acceptable under reduced motion but should still be removed if duration is non-zero.
