---
component: Button
platform: react-native (Windows, macOS)
---

# Button Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `button` (native `<button>` element preferred; `role="button"` on non-button elements requires manual keyboard event handling).
- **Required attributes:**
  - `aria-label` — required on Icon only layout; must describe the action, not the icon name (e.g., "Close dialog", not "X icon").
  - `aria-pressed="true|false"` — required when the Selected axis is active (toggle button pattern).
  - `aria-disabled="true"` — use on disabled buttons that should remain in the tab order for screen reader announcement. Use the native `disabled` attribute when the button should be entirely removed from interaction.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** All text and icon colors must meet 4.5:1 against their background at rest. Verify disabled tokens — intentionally below full contrast but should remain legible.
  - **2.1.1 — Keyboard:** Enter and Space must activate the button. Do not intercept Tab.
  - **2.4.7 — Focus Visible:** Focus ring must be visible in all non-disabled states. Use the system focus ring instance.
  - **2.5.8 — Target Size (Minimum, AA):** Minimum interactive target is 24×24px. Small Icon only (24×24px) meets the minimum boundary; ensure no adjacent interactive elements encroach. Medium and Large exceed the minimum.
- **Screen reader:** Announces label (or `aria-label`), role, and state (`pressed` when Selected=True, `dimmed`/`unavailable` when disabled).

---

## Usage

- **Icon-only accessibility pairing:** Icon only Buttons require both an `aria-label` (for screen readers) and a visible alternative like a Tooltip (for sighted users who don't recognize the icon). Neither is optional.
- **Toggle state communication:** When the Selected axis is active, the `aria-pressed` attribute must reflect the current state so assistive technology can announce the toggle.
