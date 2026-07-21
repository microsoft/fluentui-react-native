---
component: Divider
platform: react-native (Windows, macOS)
---

# Divider Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `separator` (native `<hr>` element preferred for horizontal dividers; `role="separator"` for vertical or non-`<hr>` implementations).
- **Required attributes:**
  - `aria-orientation="vertical"` — required when Vertical=True. Horizontal is the implicit default and does not need to be declared.
  - When the Divider contains a visible label, the `<hr>` or `role="separator"` element should reference the label via `aria-label` or `aria-labelledby` so assistive technology can announce the section boundary context.
- **WCAG:**
  - **1.3.1 — Info and Relationships:** The separator role communicates that a thematic break exists between content groups. Ensure the semantic element is present in the DOM, not just a visual line.
  - **1.4.3 — Contrast (Minimum):** The label text (`--gnrc-color-foreground-neutral-secondary`) on the page surface must meet 4.5:1 contrast. The line itself (`--gnrc-color-stroke-neutral-subtle`) is decorative and not subject to minimum contrast, but should remain perceptible.
  - **1.4.11 — Non-text Contrast:** The divider line must have at least 3:1 contrast against the adjacent background if it conveys meaningful boundaries (not purely decorative).
- **Keyboard:** Not applicable — Divider is not focusable.
- **Screen reader:** Announces "separator" (with label text if present). Decorative dividers may use `aria-hidden="true"` to reduce verbosity when the separation is already communicated by heading structure.

---

## Usage

- **Semantic markup:** Use the native `<hr>` element for horizontal dividers or `role="separator"` for vertical / non-`<hr>` implementations. Purely visual `<div>` elements with no semantic role are inaccessible.
- **Orientation attribute:** When Vertical=True, set `aria-orientation="vertical"`. Omitting this causes assistive technology to assume horizontal, misrepresenting the layout.
- **Decorative dividers:** When the separation is already communicated by heading structure, apply `aria-hidden="true"` to reduce screen reader verbosity.
