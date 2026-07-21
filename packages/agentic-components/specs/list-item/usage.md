---
component: ListItem
---

# ListItem Usage

## When to Use

- As an individual row inside a `flex-components:list` — the standard and only intended use case.
- To represent one of a collection of independent, like items (a person, file, setting, navigation entry, notification).
- When the row needs an optional leading icon or Avatar, an optional secondary content line or column, and/or one or more trailing action buttons.
- When the row needs to participate in single- or multi-selection — drop in a parent List with Selection mode = Single or Multiple and ListItem will render the indicator automatically.

### vs ListboxItem

ListItem and ListboxItem share most of the same row anatomy but belong to different surfaces and ARIA patterns.

- **Surface.** ListItem lives inline in the page inside a `flex-components:list`. ListboxItem lives inside a Dropdown's Popover (a transient selection overlay).
- **ARIA.** ListItem's role is set by its parent List's `navigationMode` × `Selection mode` matrix (`listitem` / `option` / `row`) — see `flex-components:list` accessibility.md. ListboxItem is always a `<button>` with `aria-pressed`.
- **Action items.** ListItem supports a Trailing container with one or more action buttons; ListboxItem does not — it is a single-purpose option row.
- **Sizes.** ListItem supports Small / Medium / Large; ListboxItem has a single Medium density.

Use ListItem for inline content rows; use ListboxItem for rows inside a Dropdown.

### vs MenuItem

MenuItem represents an action or command inside a Menu's transient Popover. ListItem represents persistent content in a page-level List. If the row dismisses an overlay on activation, it's a MenuItem. If the row stays on the page after activation (drill-in, toggle selection, run an action that doesn't dismiss anything), it's a ListItem.

### vs Button

Button triggers a single discrete action and lives anywhere in the page flow. ListItem is one row inside a collection of like rows. Use Button for "do this one thing"; use ListItem for "this is one of many similar things, possibly selectable, possibly drillable."

---

## Behavior

- **ListItem is owned by the parent List.** Do not render ListItem outside of a `flex-components:list` container. Keyboard navigation, focus orchestration, ARIA role choice, and selection authority all live on the List.
- **Row focus and activation are owned by the parent List's contract.** Do not bypass it by attaching focus or activation behavior directly to a row — the parent's keyboard model and roving tabindex will silently break. The platform specifics live in `interaction.md` and `accessibility.md`.
- **Action items are independent.** A trailing action button must never toggle the row's selection or fire the row's `onAction`. Stop event propagation at the action button.
- **Selected state is rendered, not authoritative.** The Selected axis controls the row's visual appearance. The actual selection authority lives at the parent List level — ListItem reflects what the List tells it to reflect.
- **Multiple-mode rows do not show the soft selected background.** The visible Multiselect Checkbox already communicates selection, so the row-level soft fill is suppressed. Label font-weight swap and icon Regular→Filled swap still apply.
- **Leading icon vs Avatar is a content choice, not a style choice.** Use a leading icon for category/type indicators (file kind, status, system concept). Use an Avatar for identity (person, team, account, file owner). The two slots are mutually exclusive in practice.

---

## Layout

- **Size is set by the parent List, not per row.** Every ListItem in a single List should share the same Size value so rows align consistently. Mixing Sizes within one List is incoherent.
- **Default Secondary content position to Right.** Rows are scanned vertically; Right keeps each row a single line and preserves the scan rhythm. Use Under only when the secondary content is genuinely longer (description, email address, multi-line context).
- **Limit visible Action items to two.** A row with three or more visible action buttons clutters the trailing edge and creates too many in-row focus stops. Collapse extras into an overflow Menu (one icon-only Subtle Button + Menu).
- **Disabled cascades from the parent List.** Setting the parent List to Disabled disables every row. Set Disabled per ListItem only when individual rows must be disabled while the rest remain active.

---

## Content

- **Primary label.** One short, scannable phrase. Sentence case. No trailing punctuation. Lead with the most identifying word so a vertical scan surfaces the differences between rows.
- **Parallel construction.** All primary labels in one List should be the same part of speech and grammatical structure — all nouns, or all short phrases, not mixed.
- **Secondary content.** Reserve for genuinely useful metadata (status, timestamp, owner, count, description). If the secondary line would be roughly the same across every row, omit it — it adds row height without adding information.
- **Avoid icon-only or avatar-only rows without a visible label.** If the row's identity is conveyed only by an icon or Avatar, pair it with a visible primary label (icon + text, avatar + name). When that isn't possible, give the row a programmatic accessible name (see `accessibility.md`).
- **Action button labels.** Trailing action buttons are icon-only; their accessible name must describe the action ("Edit", "More options"), not the icon name ("Three dots"). See `flex-components:button` for label conventions.
