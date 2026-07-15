---
component: Popover
platform: react-native (Windows, macOS)
---

# Popover Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** The popover container should have `role="dialog"` when it contains interactive content, or `role="tooltip"` when it contains only static descriptive text (rare — prefer Tooltip for this case).
- **Required attributes:**
  - `id` on the popover container — referenced by the trigger's `aria-controls`.
  - `aria-controls="{popoverId}"` on the trigger — associates the trigger with the popover.
  - `aria-expanded="true|false"` on the trigger — reflects the visibility state.
  - `aria-haspopup="dialog"` on the trigger — indicates the trigger opens a dialog-like surface.
  - `aria-label` or `aria-labelledby` on the popover container — when using `role="dialog"`, the popover must have an accessible name (e.g., from a heading inside the content).
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Content foreground against the surface fill must meet 4.5:1.
  - **1.4.13 — Content on Hover or Focus:** If opened on hover (non-standard), must be persistent, dismissible, and hoverable per WCAG requirements.
  - **2.1.1 — Keyboard:** Must be operable entirely by keyboard — open, navigate content, and dismiss.
  - **2.4.7 — Focus Visible:** Focus ring must be visible on all focusable elements inside the popover.
  - **2.1.2 — No Keyboard Trap:** Focus must be able to leave the popover via Escape or by tabbing past the last element (implementation-dependent).
- **Screen reader:** On open, the screen reader should announce the popover's accessible name and role. On close, the trigger should regain focus with no extraneous announcement.

---

## Usage

- **Focus return:** Always return focus to the trigger on dismissal. Losing focus on close is a keyboard accessibility failure.
- **Accessible name:** Always give the popover an accessible name when using `role="dialog"`. Use `aria-labelledby` pointing to a heading inside the content, or `aria-label` if no heading is present.
- **Trigger attributes:** Always set `aria-expanded` and `aria-controls` on the trigger. Without these, assistive technology users cannot determine the popover's state or relationship to the trigger.
