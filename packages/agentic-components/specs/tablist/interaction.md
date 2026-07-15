---
component: Tablist
platform: react-native (Windows, macOS)
---

# Tablist Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus into and out of the Tablist as a group.
- **Arrow Left / Arrow Right** — moves focus between Tab children (roving tabindex pattern). Focus wraps from last to first and vice versa.
- **Enter / Space** — activates the focused Tab, setting its Selected=True and deselecting all siblings.
- **Home / End** — moves focus to the first or last Tab in the Tablist.

## Focus management

Tablist uses roving tabindex: only one Tab is in the tab order at any time. Arrow keys move the active tabindex between tabs. The End content slot (if present) is a separate tab stop — it does not participate in arrow key navigation. Disabled tabs are skipped during arrow key navigation but remain in the DOM.

## Automatic vs manual activation

Two activation strategies exist:

- **Automatic** — focus change immediately activates the tab (Selected follows focus). Preferred when panel content loads instantly.
- **Manual** — focus moves independently; Enter/Space is required to activate. Use when panel content is expensive to load or when accidental activation would be disruptive.

Document which strategy is in use. Automatic is the default recommendation.

## Animation

No Tablist-level animations. State transitions on child Tabs follow the Tab component's motion tokens.

> **Reduced motion:** Handled at the child Tab level — no Tablist-specific motion to reduce.
