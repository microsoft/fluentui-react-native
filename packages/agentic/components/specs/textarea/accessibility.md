---
component: Textarea
platform: react-native (Windows, macOS)
---

# Textarea Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** `textbox` with `aria-multiline="true"` — provided implicitly by the native `<textarea>` element. Prefer the native element over a `role="textbox"` wrapper; the native element supplies multi-line value semantics, selection, scroll behavior, and IME handling that custom roles cannot replicate.
- **Required attributes:**
  - `aria-multiline="true"` — implicit on native `<textarea>`; required if using a `role="textbox"` container to distinguish from single-line textbox.
  - `aria-invalid="true"` — required when the Error state is active. Must be synchronized with the visual state — set both together, clear both together.
  - `aria-readonly="true"` — required when the Read only state is active. The native `readonly` attribute provides the same semantic; set both for resilience across assistive technologies.
  - `aria-disabled="true"` — use on disabled textareas that should remain in the tab order for screen reader announcement. Use the native `disabled` attribute when the textarea should be entirely removed from interaction.
  - `aria-describedby` — should reference the Field's helper text or error message when Textarea is wrapped in a Field component, so the supporting text is announced alongside the value.
  - `aria-label` or `aria-labelledby` — required when no visible label is provided. Placeholder text alone does not satisfy this requirement.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Value text and placeholder text must meet 4.5:1 against the background. Placeholder text uses tertiary foreground (`--gnrc-color-foreground-neutral-tertiary`) which is intentionally lower contrast than value text but must still meet the minimum.
  - **1.4.11 — Non-text Contrast:** The stroke boundary must meet 3:1 against the adjacent background in all interactive states. Verify the disabled stroke (`--gnrc-color-stroke-neutral-disabled`) — intentionally below full contrast and must be paired with the disabled foreground so the control reads as unavailable.
  - **2.1.1 — Keyboard:** Textarea must be focusable and operable via keyboard. Enter inserts a newline (does not submit). Tab moves focus away from the textarea.
  - **2.4.7 — Focus Visible:** Textarea uses a component-specific focus indicator instead of the standard dual-outline focus ring. Focus maps to DOM focus and swaps the boundary stroke to `--gnrc-color-stroke-neutral-heavy`.
  - **2.5.8 — Target Size (Minimum):** Textarea's minimum dimensions exceed the 24×24px target size requirement.
  - **3.3.2 — Labels or Instructions:** Textarea alone does not provide a label. Wrap in Field or provide `aria-label` / `aria-labelledby`.
- **Screen reader:** Announces the accessible name (from `<label for>`, `aria-label`, or `aria-labelledby`), the role ("edit text, multi-line" or equivalent), and the current value. State transitions announce the active error (`aria-invalid`), readonly (`aria-readonly`), or disabled (`aria-disabled` / native `disabled`) condition when set.

---

## Usage

Implementation-time considerations that cannot be solved at build.

- **Zoom:** At 200% zoom, Textarea should reflow within its container. Avoid fixed widths that would cause horizontal scrolling. At 400% zoom, ensure the textarea remains usable — content should remain scrollable and the resize handle (if visible) should remain accessible.
- **Reduced motion:** see the reduced-motion blockquote in `interaction.md`.
- **Read only vs Disabled for screen readers:** Read only textareas remain in the tab order and announce their value. Disabled textareas may be skipped by some screen readers. Choose Disabled when the user does not need to discover the value; Read only when the value carries information (e.g., a generated summary or a confirmation field).
- **Combinations with Field:** When combining with Field, ensure the Field label is programmatically associated via `for`/`id` or `aria-labelledby`. Do not rely on visual proximity alone — adjacency does not create a programmatic label.
- **Placeholder vs label:** Never use placeholder text as the only label. Placeholder text disappears on input and is announced inconsistently across assistive technologies.
- **Resize and reflow:** When the user resizes the textarea, surrounding content should reflow appropriately. Avoid layouts where textarea resize causes overlapping content or hidden interactive elements.
