---
component: Accordion
platform: react-native (Windows, macOS)
---

# Accordion Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus to and from the Header.
- **Enter / Space** — toggles the Expanded state.
- No arrow key navigation within a single accordion item. Arrow navigation between items in a group is the responsibility of the parent container.

## Focus management

Focus is scoped to the Header only. Body content manages its own focus independently.

## Open / close

Single vs. multi-expand behavior (whether multiple items can be open simultaneously) is managed at the accordion group level, not by this component.

## Animation

The chevron rotates between Expanded states (right → down). The body panel height transition references motion tokens once defined.

> **Reduced motion:** When the OS reduce-motion setting is set, both the chevron rotation and body height transition should be instant.
