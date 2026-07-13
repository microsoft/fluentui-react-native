---
component: ListboxItem
---

# ListboxItem Usage

## When to Use

- As an individual option inside a Dropdown's Popover (Input + Popover composition) — the standard use case.
- As a selectable row inside any custom selection overlay built on Popover that follows the same parent-owned focus and selection model.
- To group options under a Section Header label within the same Popover.
- When an option needs to indicate persistent selection (the currently-chosen value, single or multi) — use the Selected axis.

### vs MenuItem

ListboxItem and MenuItem share anatomy, slots, and most tokens, but they belong to different ARIA patterns and represent different user intents.

- **Intent.** ListboxItem represents a candidate *value* within a selection set (one of these is or becomes the answer). MenuItem represents a discrete *action* or command within a transient overlay.
- **Selection semantics.** Selected on ListboxItem means "this is the chosen value" — persistent and announced as `aria-pressed`. Selected on MenuItem means "this option is active in this menu" (e.g. a single-select submenu of view modes) — announced as `aria-checked` via `menuitemradio` / `menuitemcheckbox`.
- **Element + role.** ListboxItem is a `<button type="button">` with `aria-pressed`. MenuItem is an element with `role="menuitem"` (or `menuitemradio` / `menuitemcheckbox`). Both receive real DOM focus from their parent — the parent moves focus between them with arrow keys.
- **Container.** Use ListboxItem inside a Dropdown's Popover (or another selection overlay built on Popover). Use MenuItem inside a Menu. Do not swap them — the ARIA roles, keyboard semantics, and announcement patterns are not interchangeable.

### vs Button

Button triggers a discrete action and lives in the page flow. ListboxItem lives inside a transient selection overlay (typically a Dropdown's Popover) and represents a value within a selection set, communicated by `aria-pressed`. Use Button for "do something"; use ListboxItem for "pick this value".

---

## Behavior

- **ListboxItem is intended for selection overlays — typically Dropdown.** The parent (Dropdown) owns keyboard navigation, focus movement between rows, selection orchestration (which rows are `aria-pressed="true"`), and overlay dismissal. ListboxItem renders the visual response to that orchestration.
- **Never use Section Header as an interactive option.** Section Headers are non-focusable group labels rendered inside the parent surface. Use List Item for all selectable options.
- **Never mix Checkmark and Multiselect on the same option.** Checkmark indicates single-select (the chosen value); Multiselect uses a presentational Checkbox component instance for multi-select. The parent Dropdown determines which pattern is active per its Selection mode axis.
- **Always use a label-hidden Checkbox instance for Multiselect.** The Checkbox component's label is hidden — the ListboxItem label serves as the accessible name. Use square style only. The Checkbox is presentational; the row's `aria-pressed` is what assistive technology announces.
- **Always prevent layout reflow on the Selected toggle.** When Selected flips between false and true, the label weight changes from Regular to Semibold. Reserve layout space at Semibold width using a ghost node or hidden pseudo-element. This matters because selection actively cycles as the user navigates an open Popover.
- **Don't pre-empt the parent's focus model.** ListboxItem renders the focus ring on `:focus-visible` like any other `<button>`. The parent Dropdown is responsible for moving DOM focus between rows (via arrow keys, Home/End) and for returning focus to the trigger on close. ListboxItem must not implement its own arrow-key handlers or tab management.

---

## Layout

- **Default to Right secondary position.** Most option lists are scanned vertically and benefit from a tight single-line row. Reserve Under for descriptive metadata (email addresses, full names alongside a handle, multi-line context) that genuinely aids the selection decision.
- **One Section Header per logical group.** Section Headers introduce a heading inside the Popover. Multiple consecutive Section Headers with no intervening List Items are an error.
- **Match icon-or-avatar choice to the data type.** Use Icon for category/type indicators (file kind, status). Use Avatar for identity (person, team, account). The two slots are mutually exclusive in practice.

---

## Content

- **Always use the functional type ramp on labels.** Listboxes are interactive UI chrome — the content ramp is reserved for editorial and AI-generated content.
- **Write labels as values, not commands.** "Mona Kane" or "Active" reads as a selectable value. "Select Mona Kane" reads as an action and belongs on a Button or MenuItem.
- **Use parallel construction across options.** All option labels in one Popover should be the same part of speech and structure — all nouns, or all short verb phrases, but not mixed. Mismatched grammar creates a "which is the right kind of answer here" hesitation.
- **Use sentence-style capitalization.** First word capitalized; lowercase the rest unless proper nouns. Match the convention used across Field labels in the same form.
- **Include a "None" option when applicable.** When the option set allows zero-selection (e.g. "Assignee: None"), surface it as an explicit option rather than expecting the user to find a clear-selection affordance.
- **Keep secondary content scannable.** Secondary content under Right position should be short (≤30 characters). Under position can tolerate longer strings but should still avoid wrapping beyond two lines.

---

## Content restrictions

ListboxItem rows have a strict child-content contract — the row itself is a `<button>`, and any focusable or interactive descendant inside it would conflict with the parent Dropdown's keyboard model and the row's own announcement.

**Not allowed inside a row's children or slots:**

- Interactive or focusable content (buttons, links, inputs, other ListboxItems). A focusable element inside the row's `<button>` is invalid HTML and breaks Tab order — the parent Dropdown moves focus between row buttons, not between focusables nested inside them. SRs will also announce the inner element separately, which competes with the row's own announcement.
- Tooltips. They are interactive and focusable; they also introduce a parallel announcement that competes with the row's own SR announcement.
- Structured content (tables, lists, headings). SRs do not announce these meaningfully inside a button, and they introduce roles that conflict with the row's button semantics.

**Allowed:**

- Images and icons (decorative or labelled).
- Avatars.
- Generic `<div>` / `<span>` wrappers without `role` or `tabindex`.
- Plain text and short formatted spans.
- The presentational Multiselect Checkbox visual (square style, label-hidden, no `<input>` element — rendered as a `<span>` or `aria-hidden` wrapper).

For React implementations with JSX option content, supply the plain-text equivalent via the `text` (or `value`) prop so jump-to-letter typeahead (if the parent supports it) and SR announcements use a clean string.
