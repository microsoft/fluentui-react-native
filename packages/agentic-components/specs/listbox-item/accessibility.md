---
component: ListboxItem
platform: react-native (Windows, macOS)
---

# ListboxItem Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** native `<button type="button">` on List Item rows — no explicit role attribute needed (or `role="button"` if the element cannot be a `<button>`). **Not `role="option"`.** Section Header is non-interactive and is rendered as a non-focusable heading (a `<div>` or `<h*>` element with no `tabindex`); it provides a labelled boundary between groups of List Items.
- **Required attributes:**
  - `aria-pressed="true|false"` — required on every List Item row whenever the parent (typically Dropdown) is in a selection mode. Maps directly to the Selected axis. Single mode: at most one row is `aria-pressed="true"`. Multiple mode: any number of rows may be `aria-pressed="true"`.
  - `aria-disabled="true"` — on disabled rows that should remain announced by screen readers (preferred over removing the row from the DOM when the row must remain visible). Otherwise use the native `disabled` attribute.
  - `aria-label` — required when the row has no visible label (icon-only or avatar-only with no `Item string`). Must describe the value, not the icon name.
  - `id` — useful for stable identity (e.g. `aria-controls` from the trigger) but not required for selection semantics. The row's button receives DOM focus directly; there is no `aria-activedescendant` to reference it.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** All text and icon foreground must meet 4.5:1 against their background at rest. Verify disabled tokens — intentionally below full contrast but should remain legible.
  - **2.1.1 — Keyboard:** Enter / Space activates the focused row. Arrow keys, Home/End, and Escape/Tab are handled by the parent — see `interaction.md`. Every row must be reachable via the parent's keyboard model.
  - **2.4.7 — Focus Visible:** The universal dual-outline focus ring (see `flex-system:styling`) must render on the row whose `<button>` matches `:focus-visible`.
  - **2.5.8 — Target Size (Minimum, AA):** Minimum interactive target height is 40px (met by the default option height with the documented padding tokens).
  - **4.1.2 — Name, Role, Value:** Every row must have a programmatically-determinable name (label or `aria-label`), the `button` role (native `<button>`), and the `aria-pressed` value.
- **Screen reader:** Announces the row's label, "button", and pressed state ("pressed" when `aria-pressed="true"`, "not pressed" when `aria-pressed="false"`). Disabled rows announce as "dimmed" or "unavailable". Section Header announces as a heading or non-interactive group label preceding the rows it scopes.

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Correct selection ARIA — `aria-pressed`, not `aria-selected` or `aria-checked`.** ListboxItem uses `aria-pressed` because each row is a toggle button. `aria-selected` only applies inside a `role="listbox"`, `role="tablist"`, or `role="grid"` — none of which apply to Dropdown's Popover. `aria-checked` only applies on `role="checkbox"`, `role="radio"`, `role="menuitemcheckbox"`, or `role="menuitemradio"` — none of which apply here. Reaching for either of those is a common bug carried over from older Listbox-based patterns or from MenuItem's `menuitemcheckbox`/`menuitemradio` pattern.
- **Multiselect Checkbox is presentational.** When `Multiselect=true`, the trailing Checkbox visual is rendered as a presentational `<span>` (or `aria-hidden="true"` wrapper) styled like a Checkbox — NOT as an interactive `<input type="checkbox">`. The row's `aria-pressed` carries the announced selection semantics. Rendering a real `<input>` inside the row's `<button>` is invalid HTML and would cause SRs to announce the row twice.
- **Single vs multi-select.** The parent Dropdown determines how many rows may carry `aria-pressed="true"` at once — Single allows at most one, Multiple allows any number. ListboxItem itself does not enforce this; it only renders the visual state per its own Selected axis.
- **Section Header navigation:** Section Headers must not appear in the row focus cycle. They are non-focusable group labels — the parent Dropdown skips them when moving DOM focus.
- **Avoid icon-only or avatar-only rows.** Rows should carry a visible text label. Tooltips inside a row are prohibited — they introduce focusable/interactive content into the row's button, which is invalid HTML and creates a parallel announcement that competes with the row's own. If a row's identity is conveyed by an icon or avatar, pair it with a visible label (icon + text, avatar + name) rather than relying on a tooltip. For React implementations with complex JSX children, pass the plain-text equivalent via the `text` (or `value`) prop so jump-to-letter typeahead (if the parent supports it) and SR announcement work correctly.
- **Zoom:** At 200% and 400% zoom, the row must not clip its label or trailing slots. The Right secondary position should allow the secondary text to truncate before the row overflows; the Under position should allow the column to wrap into additional lines.
- **Focus lifecycle (delegated to parent Dropdown):** ListboxItem itself does not manage focus return. When the parent Dropdown closes, focus must return to the Dropdown trigger — verify this on the Dropdown layer, not here.
