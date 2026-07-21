---
component: Accordion
platform: react-native (Windows, macOS)
---

# Accordion Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** The Header should render as a `<button>` (or `role="button"`).
- **Required attributes:**
  - `aria-expanded="true|false"` — on the Header button; reflects the Expanded variant state.
  - `aria-controls="{bodyId}"` — points to the Body panel element.
  - `id` on the Body panel — referenced by `aria-controls`.
  - `aria-label` or visible title text — the Header must have an accessible name.
- **WCAG:**
  - **4.1.2 — Name, Role, Value:** The expanded/collapsed state must be programmatically determinable via `aria-expanded`.
  - **1.4.3 — Contrast (Minimum):** Title and icon foreground must meet 4.5:1 at rest and hover.
  - **2.1.1 — Keyboard:** Enter and Space must toggle the expanded state.
  - **2.4.7 — Focus Visible:** Focus ring must be visible on the Header.
  - **2.3.3 — Animation from Interactions:** Chevron rotation and body expand animation must be suppressed under reduce-motion.
- **Screen reader:** On activation, should announce the new `aria-expanded` state ("expanded" or "collapsed").

---

## Usage

- **Required ARIA attributes for state:** Set `aria-expanded` and `aria-controls` on the Header button. Without them, keyboard and screen reader users cannot determine the expanded state.
