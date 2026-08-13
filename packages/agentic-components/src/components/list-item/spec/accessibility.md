---
component: ListItem
platform: react-native (Windows, macOS)
---

# ListItem Accessibility (React Native — Windows & macOS)

> ListItem's element + role is determined by the parent `flex-components:list`'s `navigationMode` × `Selection mode` matrix — see `flex-components:list` accessibility.md for the full table. ListItem itself owns row-level attributes (`aria-selected`, `aria-disabled`, `aria-label`, `aria-current`) and the `:focus-visible` ring. Everything below is row-scoped guidance; container-scoped guidance lives on the List.

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **Element + role:** determined by parent List. Summary:
  - Parent `navigationMode="undefined"` + Selection mode = None → `<li>` (no explicit role; native list semantics).
  - Parent `navigationMode="items"` + Selection mode = None → focusable `<li>` (or `<div role="listitem">` wrapping a focusable element).
  - Parent `navigationMode="items"` + Selection mode = Single or Multiple → `<li role="option">` with `aria-selected`.
  - Parent `navigationMode="composite"` (any Selection mode) → `<div role="row">` with `aria-selected` (when selection is enabled). Each direct focusable child inside the row must be wrapped in an element with `role="gridcell"`.
- **Required attributes:**
  - **`aria-selected="true|false"`** — required on every row whenever the parent List's Selection mode is Single or Multiple. Maps directly to the Selected axis.
  - **`aria-disabled="true"`** — required on disabled rows that should remain in the DOM. Preferred over removing the row.
  - **`aria-label`** — required when the row's visible label is insufficient (icon-only or avatar-only rows, rows whose primary content is decorative). Must describe the row's value or identity, not the icon name. Set via the `aria-label` prop on the `ListItem`.
  - **`aria-current`** — set on a row when it represents the user's current location (navigation lists, "you are here" semantics). Independent of selection.
  - **`aria-setsize` / `aria-posinset`** — required on each rendered row when the parent List is virtualized so assistive technology can announce "X of N" correctly. Owned at the consuming layer.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Primary label, secondary content, leading icon, and Avatar foreground all meet 4.5:1 against their rest and selected backgrounds. Disabled foreground is intentionally below full contrast but remains legible.
  - **2.1.1 — Keyboard:** Enter (and Space in Selection modes) activate the focused row. Arrow keys, Home/End, type-ahead, and Tab are handled by the parent List — see `interaction.md` and `flex-components:list` interaction.md.
  - **2.4.7 — Focus Visible:** The universal dual-outline focus ring (see `flex-system:styling`) must render on the row whose interactive element matches `:focus-visible`. In composite mode, inner focusables (Action items) render their own focus rings independently.
  - **2.5.8 — Target Size (Minimum, AA):** Default row height at Medium meets 40px with the documented padding tokens. At Small size, verify the row remains ≥24px (the WCAG 2.5.8 minimum) — Small density rows are denser but must not fall below the floor. Trailing Action item Subtle Buttons must independently meet 24×24 px.
  - **4.1.2 — Name, Role, Value:** Every row must have a programmatically determinable name (primary label or `aria-label`), the role assigned by the parent's matrix, and (where applicable) its selection state via `aria-selected`.
- **Screen reader:** Announces the row's label, its role per the parent's matrix (`list item` / `option` / `row`), and (when applicable) its selection state ("selected" / "not selected"). Disabled rows announce as "dimmed" or "unavailable". Inner focusables in composite mode announce their own role + name independently when focused.

---

## Usage

Implementation-time considerations that cannot be solved at build.

- **`aria-selected`, not `aria-pressed` or `aria-checked`.** ListItem's selection attribute is `aria-selected` because the parent List uses `listbox`/`option` (items mode + selection) or `grid`/`row` (composite mode + selection) roles. This is intentionally different from `flex-components:listbox-item`, which uses `aria-pressed` because its row is a `<button>`. Don't carry the listbox-item attribute over.
- **The Multiselect Checkbox and Single-select Radio in the Selection slot are presentational.** They are rendered as visual stand-ins for the selected indicator zone — the row's `aria-selected` carries the announced selection state. Implementations may render the Checkbox/Radio without a real `<input>` (use a styled `<span>` with `aria-hidden="true"`) to avoid double-announcement.
- **Composite-mode Action items must be wrapped in `role="gridcell"`.** Without the wrapper, screen readers misread the grid traversal. The wrapper is responsibility of the consumer composing the row's children — ListItem provides the Trailing slot but cannot enforce the role attribute on children inserted there.
- **Action items inside rows.** Each Action item is a focus stop in composite mode. More than two action buttons per row creates too many in-row focus stops and slows keyboard traversal — collapse extras into an overflow Menu.
- **Icon-only rows.** Avoid rows whose only visible content is a leading icon or Avatar. If unavoidable, set `aria-label` on the row to describe its value or identity. Do not rely on a tooltip — tooltips are interactive/focusable and would conflict with the row's own interaction in composite mode.
- **Disabled rows.** Disabled cascades from the parent List, but per-row Disabled is also supported. A disabled row must still announce its label and "dimmed"/"unavailable" state — do not remove it from the accessibility tree unless it is also removed from the visual tree.
- **Reduced motion.** All row state transitions (Hover, Pressed, Selected) and the leading icon's Regular→Filled swap should be instant under the OS reduce-motion setting. The Selected font-weight swap is already instant.
- **Zoom (200%–400%).** At Right secondary position, allow secondary text to truncate before the row overflows; at Under position, allow the column to wrap onto additional lines. Prefer Under for lists with long secondary content — its zoom behavior is more predictable.
- **Focus lifecycle.** ListItem does not own cross-page focus state. If activating a row drills into a detail view and the user returns, focus restoration is owned by the consuming surface, not ListItem or List.
