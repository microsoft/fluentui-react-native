---
component: Dropdown
---

# Dropdown Usage

## When to Use

- To let users pick one (Single) or many (Multiple) values from a known set of options within a form.
- To compress a long list of options into a compact trigger, revealing the list on demand.
- To filter or sort information in a UI — Dropdown is the standard control for "show me only / sort by \_\_\_" selections.
- When the surrounding form uses Input components — Dropdown's Style and Size axes match Input so the form reads as a unified set of fields.
- When you need JSX or styled options (icons, avatars, custom layout) — otherwise prefer native `<select>` (see vs Select below).

### When NOT to Use

- **Do not use for typeahead/filtering.** Dropdown's trigger is a non-editable `<button>`; it cannot accept text input. If users need to type to narrow the list, use a Combobox (not yet built — flag the gap rather than misusing Dropdown).
- **Do not use for ≤ 10 always-visible options.** RadioGroup (Single) or CheckboxGroup (Multiple) are significantly more discoverable and more accessible when the option set is small.
- **Do not use for actions.** Dropdown returns a _value_. If the affordance is "pick what should happen next", that's a Menu attached to a Button.
- **Do not use as a navigation control.** Picking a value should not navigate the user to a new page; that's a nav component pattern.

### vs Select

Native `<select>` is the preferred control for simple single-select use cases — it has better performance, stronger built-in accessibility, and native mobile pickers on iOS/Android. Use Dropdown over Select only when one of the following is required:

- Styled or JSX options (icons, avatars, custom layouts).
- Multi-select.
- Virtualization of long lists.
- Controlled popup behavior or non-standard positioning.

If none of those apply, reach for Select first.

### vs Combobox

Combobox is the typeahead-filtering selection control. It is built on a real `<input>` element, carries `role="combobox"` with a paired `role="listbox"` popup, and allows free-form text entry to narrow the list. Dropdown is built on a non-editable `<button>`, has no listbox role on its popup, and never accepts text input. Choose Combobox when users need to type a value; choose Dropdown when the value comes only from the option set and a button-and-popover affordance is sufficient.

### vs Menu

Menu invokes _actions_ (`role="menu"`, `menuitem`). Dropdown selects _values_ — its rows are `<button>` elements with `aria-pressed`. Same UI affordance ("popover with a list inside"), different intent. If the rows trigger actions ("Edit", "Delete", "Duplicate"), use Menu. If the rows are candidate values ("Active", "Inactive", "Archived"), use Dropdown.

### vs RadioGroup

RadioGroup shows all single-select options inline, always visible. Dropdown hides options behind a trigger until opened. Prefer RadioGroup when the option set is small (<10) and the choice matters enough to surface up front. Prefer Dropdown when options are many or screen space is tight.

### vs CheckboxGroup

Same axis as RadioGroup, for Multiple selections. CheckboxGroup keeps all options visible; Dropdown (Multiple mode) hides them behind a trigger. Same threshold: prefer CheckboxGroup under 10 options.

---

## Behavior

- **Always render the trigger as a non-editable `<button>` element.** Not an `<input>`, not a `role="combobox"`. Typing into the trigger must not be possible. If typing seems necessary, the design needs a Combobox, not a Dropdown.
- **Never nest interactive content inside the trigger.** The trigger is a single `<button>`. Putting other buttons, links, or focusables inside it breaks SR announcement and the focus model. The clear-selection affordance (when added) is a sibling slot in the trigger anatomy, not a nested button inside it.
- **Single mode closes on activation; Multiple mode stays open.** Activating an item in Single mode commits the value and dismisses the Popover. In Multiple mode, activation toggles the row's selection state and the Popover remains open until light-dismiss (click outside or Escape).
- **Always return focus to the trigger on close.** Whether the Popover closes via activation (Single), Escape, Tab, or click-outside, DOM focus must return to the trigger. Losing focus after dismissal breaks keyboard flow.
- **Value display must reflect Selection mode.**
  - Single: show the chosen option's label (or placeholder if empty).
  - Multiple: show the selected labels (comma-separated) and **auto-fall-back to a count summary ("3 selected") when the labels exceed the trigger's container width**. This is the default behavior in Fluent. Designers may opt into a token-strip variant (each selection rendered as a Tag inside the trigger) for surfaces where individual dismissal from the trigger is needed — call this out at the instance level rather than mixing patterns within a form.
- **Never nest Dropdowns inside a Dropdown's item row.** A row that opens another dropdown is a hierarchical pattern — use a tree or a multi-step picker instead.
- **Never make the trigger label change when the popover is open.** The trigger should display the current value (or placeholder) regardless of open state. Hiding the value when open creates visual noise during selection.
- **Disabled cannot be Open.** A disabled trigger does not open the popover. Implementations must guard against programmatic open while Disabled=true.

---

## Layout

- **Match Style to surrounding Inputs.** Outline-form forms get Outline dropdowns; Underline-form forms get Underline dropdowns. Mixed chrome in one form reads as a bug.
- **Match Size to the form's density tier.** Don't mix Medium Inputs with a Small Dropdown — pick a tier per form.
- **Trigger width is content-determined or container-driven.** Default to the trigger fitting the value display + chevron + padding. In grid forms, stretch to the column width.
- **Popover width ≥ trigger width.** The Popover should be at least as wide as the trigger, optionally wider if option labels exceed the trigger width. Never narrower — the option list should never look "trimmed" relative to the trigger.
- **Popover height is parent-bounded.** The row list scrolls internally beyond a product-level row cap (typically 8–10 rows visible). The Popover's max-height is constrained by the viewport.
- **Error state placement.** Error state (red stroke) lives on the trigger, mirroring Input Error. Error messaging text lives in a Field wrapper or below the trigger — Dropdown does not own its own helper-text slot.
- **Place Dropdown only on sufficiently-contrasting surfaces.** The trigger's stroke (Outline) or bottom edge (Underline) must meet 3:1 against the _immediately surrounding_ page color, not just against the trigger's own background. Dropdowns placed on subtle panels over subtle pages frequently fail — verify in context. Underline-style Dropdowns additionally need 4.5:1 between placeholder/value text and the page background.

---

## Content

- **Placeholder describes the choice, not the action.** "Select a status" reads as a placeholder. "Click to pick" reads as a button label — wrong tier.
- **Value display in Single mode is the option's label, verbatim.** Don't paraphrase or shorten — let the user see exactly what they selected. If the label is too long for the trigger width, truncate with an ellipsis at the trigger; the full label remains visible in the Popover when the user re-opens. Avoid tooltips on the trigger for the full label (they interfere with the trigger's button semantics); prefer a wider trigger or an Under-position secondary in the row to surface long labels.
- **Multiple-mode summary writing.**
  - Labels first: render selected labels comma-separated until they exceed the trigger width.
  - Auto-overflow to count: when labels would exceed the trigger width, the trigger renders "{N} selected".
  - Do not pre-emptively choose count when labels fit — labels carry more meaning when there is room for them.
- **Leading slot icon should match the value's semantic.** If the selected row has a leading icon in the Popover, mirror it in the trigger so the user sees they picked the right thing. Don't introduce a different icon at the trigger level.
- **Use sentence case for option labels.** Match the casing convention used across ListboxItem and form labels in the codebase.
