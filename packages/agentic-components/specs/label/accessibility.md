---
component: Label
platform: react-native (Windows, macOS)
---

# Label Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** Use the native `<label>` element with a `for` attribute referencing the associated control's `id`. Native `<label>` provides click-to-focus and screen-reader association without any `role="*"` wrapper. Use `role="label"` only when the visual label cannot be a real `<label>` element (e.g. naming a custom composite control); in that case, associate via `aria-labelledby` from the control to the labeling node.
- **Required attributes:**
  - `for` (on `<label>`) — must match the `id` of the associated control. Without it, click-to-focus and screen-reader association are both lost.
  - `aria-required="true"` (on the associated control, not on Label) — required state is communicated by the control's ARIA attribute, not by the Label's visual asterisk alone. The asterisk is a visual cue for sighted users; assistive technology relies on `aria-required`.
- **WCAG:**
  - **1.3.1 — Info and Relationships:** The label-to-control association must be programmatically determinable via `<label for>` or `aria-labelledby`. Visual proximity alone does not satisfy this criterion.
  - **1.4.3 — Contrast (Minimum):** Label text uses `--gnrc-color-foreground-neutral-primary` (≥4.5:1 against page background per the token system). Disabled labels intentionally fall below this ratio; they pair with disabled controls, which are exempt under WCAG 1.4.3.
  - **1.4.11 — Non-text Contrast:** The required asterisk uses `--gnrc-color-foreground-danger-primary`. Because the asterisk also has a textual character (the `*` glyph), it qualifies as text under 1.4.3 rather than as a non-text indicator under 1.4.11.
  - **3.3.2 — Labels or Instructions:** Every form control must have a Label or equivalent accessible name. This component is the primary mechanism for satisfying 3.3.2 in Fluent Flex form compositions.
  - **4.1.2 — Name, Role, Value:** When using native `<label for>`, the name is exposed automatically. For custom composites using `aria-labelledby`, verify the referenced node has visible text and that the control exposes its role and current value.
- **Screen reader:**
  - With native `<label for>`: the screen reader announces the label string when focus moves to the associated control. Example: "Email address, edit text, required" for a required Input.
  - Required state is announced via the control's `aria-required="true"` — not via the visual asterisk. If only the asterisk is present (no `aria-required`), screen reader users will not hear that the field is required.
  - Disabled state announcement comes from the associated control's `disabled` or `aria-disabled` attribute, not from Label. Label has no independent disabled announcement.

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Zoom:** Label text uses functional body text styles that respect user font-size preferences and reflow at 200% and 400% zoom. The Required asterisk remains inline with the text and does not overflow at zoom levels supported by Fluent Flex. Long label strings wrap to multiple lines — verify the Field wrapper's vertical layout accommodates multi-line labels without truncating.
- **Required marker alone is not sufficient.** The visual asterisk must be paired with `aria-required="true"` on the associated control. If a form has any required fields, also include a key elsewhere on the surface ("\* indicates required field") for users who do not recognize the asterisk convention. The asterisk alone fails 3.3.2 for users who cannot see it and for users unfamiliar with the convention.
- **Visible label vs. accessible name parity:** When the visible Label string is "Email address", the accessible name exposed via `<label for>` must be the same string. Substituting a shorter accessible name (e.g. "Email") while displaying the longer string creates a "label in name" failure under WCAG 2.5.3 — Label in Name for voice-control users who say what they see.
- **Combinations:** If Label sits inside a Field that also renders helper text and validation messages, the implementation must wire `aria-describedby` on the associated control to reference the helper text and the active validation message. Multiple `aria-describedby` IDs are valid and announced in order.
