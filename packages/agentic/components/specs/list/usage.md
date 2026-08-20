---
component: List
---

# List Usage

## When to Use

- To present a collection of like items in a vertical stack where each item is independent of the others (people, files, settings, navigation entries, notifications).
- To make a set of items easy to scan and access without imposing a relational column structure.
- To allow single or multiple selection across persistent, scannable rows (use Selection mode = Single or Multiple).
- To support drill-in navigation where activating a row opens a detail view or sub-screen.

### vs DataGrid / Table

DataGrid and Table render rows whose columns relate to each other — a user reads across a row to compare attributes (Name, Status, Owner, Date). List renders rows whose content is self-contained — a user reads down the list to scan independent items. If columns matter, use DataGrid or Table; if rows are peers without relational columns, use List.

### vs Tree

Tree renders nested, hierarchical content with expand/collapse affordances. List renders a flat, single-level collection. If items have parent/child relationships that the user navigates by expanding, use Tree; if items are siblings at one level, use List.

### vs Menu

Menu is an overlay surface that renders inside a Popover and dismisses on action selection. List is inline content that persists on the page. If items live inside a transient overlay triggered from a button, use Menu; if items live in the page itself, use List.

### vs Dropdown

Dropdown collapses a value-selection list inside a Popover behind a trigger; the list is only visible while the Popover is open. List is the persistent inline equivalent — appropriate when the choices should always be visible and scannable, or when the surrounding context (a settings pane, a filter panel) makes inline rows preferable to a collapsed control.

### When NOT to Use

- Do not use for relational tabular data — use DataGrid or Table.
- Do not use for nested/hierarchical content — use Tree.
- Do not use as a transient overlay surface — use Menu or Dropdown.
- Do not use for a small fixed set of mutually exclusive choices that fit inline — use RadioGroup.

---

## Behavior

- **Items are independent.** Each row must stand on its own. If a row's meaning depends on the row above or below it (totals, dependencies, parent/child), the wrong component is being used — reach for Tree or Table instead.
- **Activate vs select.** When Selection mode is None, activating a row should perform a single primary action (open detail, navigate). When Selection mode is Single or Multiple, activating a row toggles the row's selection — primary actions move into the row's Action items slot or a separate page action.
- **Action items are independent of selection.** Clicking a trailing action (overflow, edit, dismiss) must never toggle the row's selection or trigger the row's primary activation. Stop event propagation at the action button.
- **Cascade Disabled with care.** Disabling the List as a whole disables every row, including their action buttons. If only certain rows should be disabled, set Disabled per ListItem instead of at the container.
- **Pick one Selection mode per List.** Do not mix Radio and Checkbox indicators within the same list. If different rows in the same surface have different selection semantics, split them into separate Lists with their own Selection mode.

---

## Layout

- **Density follows Size.** Small for information-dense surfaces (settings panes, sidebars, dialog body lists). Medium for default content lists. Large for touch-first contexts or rows with Avatars and rich secondary content.
- **Separators are intentional, not decorative.** Use Divider between rows only when groups of items need explicit visual separation. Adjacent ListItem rows already provide a clean vertical rhythm via their own padding — adding dividers everywhere is visual noise.
- **No container padding.** The List itself adds no padding around the row stack. The parent surface (Card, Pane, Dialog) owns padding around the List as a whole.
- **Width fills the parent.** List stretches to its parent container's width. Individual rows fill the List's width; do not constrain row widths inside the container.

---

## Content

- **Primary label.** One short, scannable phrase per row. Sentence case. No trailing punctuation. Lead with the most identifying word so a vertical scan of the list surfaces the differences between rows.
- **Secondary content.** Reserved for genuinely useful metadata (timestamps, status, descriptions). If every row would say roughly the same thing, omit secondary content — it adds height without adding information.
- **Action item labels.** Action buttons in the trailing slot are icon-only; the accessible name must describe the action ("Edit", "More options"), not the icon name ("Three dots"). See `flex-components:button` for action button label guidance.
