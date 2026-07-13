---
component: List
platform: react-native (Windows, macOS)
---

# List Accessibility (React Native — Windows & macOS)

> List exposes a `navigationMode` implementation prop that drives both keyboard navigation and ARIA roles. The prop is intentionally **not** a Figma variant — it has no visual effect — but every web implementation must set it correctly. The role and attribute matrix below is determined by `navigationMode` × `Selection mode`.

## Spec

Build-time requirements that must be satisfied by the component implementation.

### Role and attribute matrix

| navigationMode | Selection mode | Container role                            | Row role                | Selection attribute | Notes                                                                                                                                                                                                                                                                                                  |
| -------------- | -------------- | ----------------------------------------- | ----------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `undefined`    | None           | `list`                                    | `listitem`              | —                   | Static, non-focusable list. Items are read by screen readers as a list but do not receive focus. Use `tabIndex={0}` on the List itself if users should be able to scroll it with arrow keys.                                                                                                           |
| `items`        | None           | `list`                                    | `listitem`              | —                   | Items are focusable and navigated with Up/Down arrows. Primary activation on Enter via `onAction`.                                                                                                                                                                                                     |
| `items`        | Single         | `listbox`                                 | `option`                | `aria-selected`     | Single-select listbox pattern. Setting `selectionMode` automatically upgrades `navigationMode` to `items` if it was `undefined` — do not double-set.                                                                                                                                                   |
| `items`        | Multiple       | `listbox` + `aria-multiselectable="true"` | `option`                | `aria-selected`     | Multi-select listbox pattern.                                                                                                                                                                                                                                                                          |
| `composite`    | None           | `grid`                                    | `row`                   | —                   | Use when rows contain inner focusable elements (action buttons, embedded controls). Up/Down moves between rows; Right/Left moves into and across the row's inner focusables. Each direct focusable child of a row must be wrapped in an element with `role="gridcell"` or screen readers get confused. |
| `composite`    | Single         | `grid`                                    | `row` + `aria-selected` | `aria-selected`     | Grid with single-selectable rows. Selection toggles via Space or checkbox click; primary action via Enter (configurable through `onAction`).                                                                                                                                                           |
| `composite`    | Multiple       | `grid` + `aria-multiselectable="true"`    | `row` + `aria-selected` | `aria-selected`     | Grid with multi-selectable rows. Same rules as composite + Single, but multiple rows may be selected.                                                                                                                                                                                                  |

> **Implicit upgrade:** Setting `selectionMode` (Single or Multiple) automatically behaves as if `navigationMode="items"` were also set. Do not pass both. **However**, if the rows contain inner focusables, you must still explicitly set `navigationMode="composite"` — selection alone won't upgrade you past `items`.

### Required attributes

- **`aria-label` or `aria-labelledby`** — required on the List container whenever its purpose isn't clear from surrounding heading context. Required when the container role is `listbox` or `grid` (those roles do not derive a name from content).
- **`aria-label` on individual `ListItem`** — when a row's visible label is insufficient (icon-only rows, ambiguous primary content), set `aria-label` on the row for the screen reader announcement.
- **`aria-selected`** — required on every row when Selection mode is Single or Multiple. Reflects the row's selection state.
- **`aria-multiselectable="true"`** — required on the container when Selection mode = Multiple.
- **`aria-disabled`** — required on disabled rows. When the List container is Disabled, every row carries `aria-disabled="true"`.
- **`aria-current`** — set on a row when it represents the user's current location (navigation lists, "you are here" semantics). Independent of selection.
- **`role="gridcell"`** — required on each direct focusable child element inside a `ListItem` when `navigationMode="composite"`. Without it, screen readers misread the grid structure.

### tabIndex

- **Use `tabIndex={0}` on the `List` itself** when items have no actionable elements and the user should be able to focus the list to scroll it with arrows.
- **Do not put `tabIndex` on `ListItem`** — use `navigationMode` instead. `navigationMode="items"` or `"composite"` handles tabindex correctly (roving tabindex internally).

### Event contract

- **Use `onAction` instead of `onClick`** on the List and on ListItem. `onAction` registers click, Enter, and (when selection is enabled) Space/checkbox-click as the primary activation. It also coordinates correctly with selection toggling.
- Enter and item click toggle selection **unless** `onAction` calls its prevention API. Space and the embedded checkbox click **always** toggle selection regardless of `onAction`.

### WCAG

- **1.3.1 — Info and Relationships:** The list structure must be programmatically determinable. The role matrix above ensures this across all navigationMode × Selection mode combinations.
- **1.4.3 — Contrast (Minimum):** Selection indicators (Checkbox check, Radio fill) and selected-state row backgrounds must meet 4.5:1 against their adjacent background. Tokens used by Checkbox/Radio/ListItem satisfy this — do not override.
- **2.1.1 — Keyboard:** Full arrow key, Home/End, Enter, Space, and Tab support per `interaction.md`.
- **2.4.3 — Focus Order:** Focus must enter on the previously focused row (or first selected / first focusable row on first entry) and exit cleanly after the last row's inner focusables (composite mode).
- **2.4.7 — Focus Visible:** The focused row (or focused gridcell, in composite mode) must show the universal dual-outline focus ring via `:focus-visible` — owned by ListItem and its inner focusable children; see `flex-system:styling`.
- **2.5.8 — Target Size (Minimum):** Selection indicators and trailing action buttons must meet 24×24 px. Checkbox and Radio at Small density already meet this; verify trailing action buttons remain at or above the threshold when Size = Small.
- **4.1.2 — Name, Role, Value:** Each row must expose its label as the accessible name, its role per the matrix, and (where applicable) its selection state via `aria-selected`.

### Screen reader

- On focus entering the List, announces the container's accessible name and role ("My files, list" / "Filters, list box" / "Mailboxes, grid"), followed by the focused row's label, role, selection state (when applicable), and position ("1 of 12").
- On arrow navigation, announces the new row's label, selection state, and position.
- On Space activation (Single/Multiple), announces the new selection state ("selected" / "not selected").
- On composite mode Right/Left arrow, announces the inner gridcell content and role.
- Disabled rows are announced as "dimmed" or "unavailable" depending on the screen reader.

---

## Usage

Implementation-time considerations that cannot be solved at build.

- **Pick `navigationMode` deliberately.**
  - Items have **no** actionable children → `navigationMode="undefined"` and `tabIndex={0}` on the List.
  - Items are focusable but contain **no** inner focusables → `navigationMode="items"`.
  - Items contain **any** inner focusables (action buttons, embedded checkboxes beyond the selection indicator, links) → `navigationMode="composite"`, and wrap each inner focusable in a `role="gridcell"` element.
  - Getting this wrong silently breaks screen-reader announcement and arrow-key navigation — there is no visual hint that it's wrong.
- **Don't pass both `selectionMode` and `navigationMode="items"`.** Setting `selectionMode` already implies `items`. Pass both only when you need `composite` explicitly.
- **Use `onAction`, not `onClick`.** `onAction` wires up Enter, Space, and checkbox-click correctly with the selection model. `onClick` will skip Enter/Space and create a keyboard-only failure that's easy to miss in mouse testing.
- **Don't put `tabIndex` on `ListItem`.** Use `navigationMode` on the List. Putting `tabIndex` on rows directly bypasses roving tabindex and creates a "tab through every row" experience that fails 2.4.3 on long lists.
- **Custom row labels.** Use `aria-label` on the `ListItem` when the visible label is insufficient (icon-only rows, image-only rows, rows where the primary content is decorative).
- **Composite-mode actions inside rows.** Each interactive child (action button, link, embedded checkbox beyond the selection indicator) must be wrapped in a `role="gridcell"` element. The button itself does not carry the gridcell role — its wrapper does.
- **Long lists and virtualization.** When virtualizing rows, set `aria-setsize` and `aria-posinset` on each rendered row so assistive technology can announce "X of N" correctly even when the DOM only holds a windowed subset.
- **Zoom (200%–400%).** Rows must reflow vertically without horizontal scrolling. Prefer ListItem's "Under" secondary content position for lists with long secondary text — it handles zoom more predictably than inline "Right".
- **Reduced motion.** All row state and selection indicator transitions become instant under the OS reduce-motion setting — see motion guidance in `tokens.yaml` and the dependency components' motion guidance.
- **Combinations.**
  - Nested Lists are not supported — use Tree for hierarchical content.
  - A List inside a Dialog's body must not create a competing focus trap; the Dialog owns the trap, the List participates with roving tabindex.
  - A List inside a Menu or Dropdown Popover is wrong by construction — those surfaces render their own row collections (MenuItem / ListboxItem).
