---
component: Toolbar
platform: react-native (Windows, macOS)
---

# Toolbar Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `toolbar` on the container element.
- **Required attributes:**
  - `aria-label` — required on the toolbar container; describes the toolbar's purpose (e.g., "Text formatting", "Drawing tools").
  - `aria-orientation="horizontal"` — explicit orientation for screen readers (horizontal is the default for `role="toolbar"`, but explicit declaration is preferred).
  - Child buttons require `aria-label` (icon-only buttons have no visible text).
  - Child toggle buttons require `aria-pressed="true|false"` when the Selected axis is active.
- **WCAG:**
  - **1.3.1 — Info and Relationships:** Toolbar grouping must be programmatically determinable via `role="toolbar"`.
  - **2.1.1 — Keyboard:** All buttons must be reachable via arrow key navigation within the toolbar.
  - **2.4.7 — Focus Visible:** Focus ring on the active button must be visible. Uses the system focus ring from child Button.
  - **2.5.8 — Target Size (Minimum, AA):** Small buttons meet the minimum boundary. Ensure toolbar gap does not cause adjacent targets to overlap.
- **Screen reader:** Announces toolbar label, number of items, and current position. Each button announces its label, role, and state.

---

## Usage

- **Icon-only button labels:** Always provide `aria-label` on every icon-only button. The label must describe the action, not the icon name (e.g., "Bold", not "B icon").
