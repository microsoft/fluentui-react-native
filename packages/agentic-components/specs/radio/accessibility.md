---
component: Radio
platform: react-native (Windows, macOS)
---

# Radio Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** `radio` (native `<input type="radio">` preferred; `role="radio"` on custom elements requires manual keyboard, roving tabindex, and state management).
- **Required attributes:**
  - `aria-checked="true|false"` — maps directly to the Status variant (Unselected → `false`, Selected → `true`).
  - Group container — in product, the Group container is provided by RadioGroup (`flex-components:radio-group`), which renders a native `<fieldset>` with `<legend>` (or `role="radiogroup"` with `aria-labelledby` on a non-fieldset element). The group container must have an accessible name describing what is being chosen.
  - Visible label association — each radio is required to render with a visible label, and that label must be programmatically associated with the input (native `<label for>` or `aria-labelledby`). The composed `flex-components:label` sub-component provides this association natively, so it is not a Radio-level implementation concern.
  - **Disabled state on native radios:** use the HTML `disabled` attribute on `<input type="radio">`. The platform removes the input from the tab order and from arrow-key navigation; screen readers announce the disabled state. Do **not** apply `aria-disabled` to a native input — `disabled` is the correct mechanism and `aria-disabled` does not match the implicit semantic.
  - **Disabled state on custom radios:** use `aria-disabled="true"` on `role="radio"` elements. The keyboard contract for disabled-radio skipping (selection-blocking and arrow-key skip) lives in `flex-components:radio-group` `interaction.md`, matching native platform behavior.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Indicator stroke and inner dot must meet 3:1 against the surrounding background. Label text must meet 4.5:1.
  - **1.4.11 — Non-text Contrast:** The indicator (as a UI component boundary) must meet 3:1 against adjacent colors in all non-disabled states.
  - **2.1.1 — Keyboard:** Arrow keys must move focus and selection between enabled Radios in the RadioGroup; Space activates the focused Radio if it is not already selected. Tab must move focus to and from the RadioGroup as a unit. Disabled radios are skipped — native via `disabled` (platform-managed), custom via `aria-disabled` plus explicit skip logic.
  - **2.4.7 — Focus Visible:** Focus ring must be visible in all non-disabled states. Uses the universal dual-outline focus ring.
  - **3.3.2 — Labels or Instructions:** Each RadioGroup must have a group-level label describing the choice being made, in addition to the per-option labels.
  - **4.1.2 — Name, Role, Value:** Each radio must expose its name, role, and current checked state to assistive technology.
- **Screen reader:** Announces the per-radio label, role ("radio button"), state ("selected" or "not selected"), and position within the group ("1 of 3"). The group label is announced when focus enters the group.

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Group naming:** Every RadioGroup must have an accessible name (legend, `aria-labelledby`, or `aria-label` on the group container). Without it, screen readers announce the individual Radios but not the question being answered.
- **Secondary text association:** When Radio renders secondary text, the implementation must wire `aria-describedby` on the `<input>` element to reference the secondary text node's `id`. This ensures screen readers announce the supplementary description after the label name (e.g. "Option A, radio button, not selected — description text"). Do not merge secondary text into the accessible name — it is supplementary context, not identification.
