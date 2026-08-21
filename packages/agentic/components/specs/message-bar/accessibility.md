---
component: MessageBar
platform: react-native (Windows, macOS)
---

# MessageBar Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `role="status"` for Information and Success (polite announcement). `role="alert"` for Warning and Error (assertive announcement). Do not use `role="alert"` for every status — over-interruption degrades the screen reader experience.
- **Required attributes:**
  - `aria-label` on the dismiss button — "Dismiss" or "Close" (not "×").
  - `aria-label` on action buttons if the label is ambiguous in context.
- **Live region behavior:** When inserted dynamically, `role="status"` / `role="alert"` ensures screen readers announce the message without requiring focus to move.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Message text must meet 4.5:1 against the rendered surface + status-background stack for all four statuses. Verify subtle backgrounds over the specified surface layer — they may produce tighter contrast ratios than a plain opaque surface.
  - **2.1.1 — Keyboard:** Action and dismiss buttons must be reachable via Tab and activatable via Enter/Space.
  - **2.4.7 — Focus Visible:** Focus rings on action and dismiss buttons must be visible.
  - **4.1.3 — Status Messages:** Must be programmatically determinable via `role="status"` / `role="alert"` so they can be announced without receiving focus.

---

## Usage

- **ARIA role per status:** Set `role="alert"` for Error and Warning (assertive). Information and Success use `role="status"` (polite). Overusing `role="alert"` desensitizes people to urgent alerts.
- **Dismissal and the DOM:** Remove the component from the DOM on dismissal (not `display: none`). A hidden MessageBar with `role="alert"` can still be announced unexpectedly by screen readers.
