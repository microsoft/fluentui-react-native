---
component: Tab
platform: react-native (Windows, macOS)
---

# Tab Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `tab` (within a `role="tablist"` container).
- **Required attributes:**
  - `aria-selected="true|false"` — reflects the Selected axis. Exactly one tab in the set must be `aria-selected="true"`.
  - `aria-controls="{panel-id}"` — references the associated `role="tabpanel"` element.
  - `aria-label` — required on Icon only layout; must describe the content panel, not the icon name (e.g., "Settings", not "Gear icon").
  - `aria-disabled="true"` — use on disabled tabs that should remain in the tab order for screen reader announcement.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Foreground tokens meet 4.5:1 against their background at rest and selected states. `onloud` on `neutral-heavy` is white on near-black.
  - **2.1.1 — Keyboard:** Arrow keys must navigate between tabs within the Tablist. Enter/Space must activate.
  - **2.4.7 — Focus Visible:** Focus ring must be visible in all non-disabled states. Uses the system focus ring.
  - **2.5.8 — Target Size (Minimum, AA):** Resultant height of `32px` with minimum width of `32px` exceeds the `24×24px` minimum.
- **Screen reader:** Announces label (or `aria-label`), role (`tab`), selection state (`selected`), and position within set (e.g., "1 of 5").

---

## Usage

- **Icon-only labels:** Always provide `aria-label` on Icon only tabs. The label must describe the content panel the tab controls, not the icon.
