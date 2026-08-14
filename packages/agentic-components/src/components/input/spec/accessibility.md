---
component: Input
platform: react-native (Windows, macOS)
---

# Input Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** `textbox` — provided implicitly by the native `<input type="text">` element. Prefer the native element over a `role="textbox"` wrapper; the native element supplies value semantics, selection, and IME behavior that custom roles cannot replicate.
- **Required attributes:**
  - `aria-invalid="true"` — required when the Error state is active. Must be synchronized with the visual state — set both together, clear both together.
  - `aria-readonly="true"` — required when the Read only state is active. The native `readonly` attribute provides the same semantic; set both for resilience across assistive technologies.
  - `aria-disabled="true"` — use on disabled inputs that should remain in the tab order for screen reader announcement. Use the native `disabled` attribute when the input should be entirely removed from interaction.
  - `aria-describedby` — should reference the Field's helper text or error message when Input is wrapped in a Field component, so the supporting text is announced alongside the value.
  - `aria-label` or `aria-labelledby` — required when no visible label is provided (e.g., search fields with only a placeholder). Placeholder text alone does not satisfy this requirement.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Value text and placeholder text must meet 4.5:1 against the background. Placeholder text uses tertiary foreground (`--gnrc-color-foreground-neutral-tertiary`) which is intentionally lower contrast than value text but must still meet the minimum.
  - **1.4.11 — Non-text Contrast:** The stroke boundary must meet 3:1 against the adjacent background in all interactive states. Verify the disabled stroke (`--gnrc-color-stroke-neutral-disabled`) — intentionally below full contrast and must be paired with the disabled foreground so the control reads as unavailable.
  - **2.1.1 — Keyboard:** Input must be focusable and operable via keyboard. Typing accepts all printable characters when focused.
  - **2.4.7 — Focus Visible:** Input uses a component-specific focus indicator instead of the standard dual-outline focus ring. Both styles swap their boundary stroke to `--gnrc-color-stroke-neutral-heavy` — Outline as the full border, Underline as the bottom edge.
  - **3.3.2 — Labels or Instructions:** Input alone does not provide a label. Wrap in Field or provide `aria-label` / `aria-labelledby`.
- **Screen reader:** Announces the accessible name (from `<label for>`, `aria-label`, or `aria-labelledby`), the role ("edit text" or equivalent), and the current value. State transitions announce the active error (`aria-invalid`), readonly (`aria-readonly`), or disabled (`aria-disabled` / native `disabled`) condition when set.

---

## Usage

Implementation-time considerations that cannot be solved at build.

- **Zoom:** At 200% zoom, Input should reflow within its container. Avoid fixed widths that would cause horizontal scrolling.
- **Read only vs Disabled for screen readers:** Read only inputs remain in the tab order and announce their value. Disabled inputs may be skipped by some screen readers. Choose Disabled when the user does not need to discover the value; Read only when the value carries information (e.g., a confirmation summary).
- **Combinations with Field:** When combining with Field, ensure the Field label is programmatically associated via `for`/`id` or `aria-labelledby`. Do not rely on visual proximity alone — adjacency does not create a programmatic label.
- **Placeholder vs label:** Never use placeholder text as the only label. Placeholder text disappears on input and is announced inconsistently across assistive technologies.
