---
component: Checkbox
platform: react-native (Windows, macOS)
---

# Checkbox Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `checkbox` (native `<input type="checkbox">` preferred; `role="checkbox"` on custom elements requires manual keyboard and state management).
- **Required attributes:**
  - `aria-checked="true|false|mixed"` — maps directly to the Status variant (Unchecked → `false`, Checked → `true`, Indeterminate → `mixed`).
  - `aria-label` or visible label association — every checkbox must have an accessible name, either from the visible label or an explicit `aria-label`.
  - `aria-disabled="true"` — use on disabled checkboxes that should remain in the tab order for screen reader discoverability.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Indicator stroke and fill must meet 3:1 against the surrounding background. Label text must meet 4.5:1.
  - **1.4.11 — Non-text Contrast:** The indicator (as a UI component boundary) must meet 3:1 against adjacent colors in all non-disabled states.
  - **2.1.1 — Keyboard:** Space must toggle the checkbox. Do not intercept Tab or use Enter for activation.
  - **2.4.7 — Focus Visible:** Focus ring must be visible in all non-disabled states. Uses the universal dual-outline focus ring.
  - **4.1.2 — Name, Role, Value:** Checkbox must expose its name, role, and current checked state to assistive technology.
- **Screen reader:** Announces label (or `aria-label`), role ("checkbox"), and state ("checked", "not checked", or "mixed").

---

## Usage

- **Hidden label fallback:** When the visible label is hidden (Label boolean is false), provide an `aria-label` for screen readers. A checkbox with no accessible name is inaccessible.
- **Secondary text association:** When Checkbox renders secondary text, the implementation must wire `aria-describedby` on the `<input>` element to reference the secondary text node's `id`. This ensures screen readers announce the supplementary description after the label name (e.g. "Option A, checkbox, not checked — description text"). Do not merge secondary text into the accessible name — it is supplementary context, not identification.
