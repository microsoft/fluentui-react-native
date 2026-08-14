---
component: Tag
platform: react-native (Windows, macOS)
---

# Tag Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus to and from the tag.
- **Enter / Space** — triggers dismiss (removes the tag).
- No arrow key navigation within a single tag. Arrow navigation between tags in a group is the responsibility of the parent container.

## Focus management

Focus follows standard platform behavior. Tag does not trap focus.

## Animation

State transitions (Rest → Hover) are platform-driven color transitions. Duration and easing reference motion tokens once defined.

> **Reduced motion:** When the OS reduce-motion setting is set, all transitions should be instant. No scale, translate, or opacity animation is used on Tag.
