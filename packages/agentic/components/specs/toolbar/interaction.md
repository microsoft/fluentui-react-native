---
component: Toolbar
platform: react-native (Windows, macOS)
---

# Toolbar Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus into and out of the toolbar as a group.
- **Arrow Left / Arrow Right** — moves focus between buttons within the toolbar (roving tabindex pattern).
- **Enter / Space** — activates the focused button (fires the action or toggles Selected state).
- **Home / End** — moves focus to the first or last button in the toolbar.

## Focus management

The toolbar uses roving tabindex: only one button within the toolbar is in the tab order at a time. Arrow keys move the active tabindex between buttons. Dividers are not focusable. Focus wraps from last to first (and vice versa) when arrow keys reach the ends.

## Animation

No toolbar-level animations. State transitions on child buttons follow the Button component's motion tokens.

> **Reduced motion:** Handled at the child Button level — no toolbar-specific motion to reduce.
