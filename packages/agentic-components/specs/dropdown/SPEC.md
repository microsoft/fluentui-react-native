---
name: dropdown
platform: react-native (Windows, macOS)
description: Composed selection control that pairs an Input-styled button trigger and an overlay Popover containing a list of selectable rows. Composes Input visual trigger chrome, Popover floating surface/light-dismiss behavior, and ListboxItem selectable rows. Forwards Input's Style and Size axes and exposes Selection mode (Single/Multiple) and Open (false/true) at the Dropdown level. Uses DOM focus on items and aria-pressed for selection — not the WAI-ARIA combobox pattern.
argument-hint: "[variant axis or behavior question, e.g. 'Open=true tokens' or 'Multiple selection trigger display']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value    |
| --------- | -------- |
| Type      | composed |
| Component | Dropdown |

This spec covers the Dropdown component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. Dropdown is a **`<button>` plus floating Popover** — not a combobox. The trigger renders as a non-editable `<button type="button">` styled with Input's chrome (Outline/Underline stroke, sizes, radius, padding, transparent background). The Popover holds a list of selectable rows (each a `<button>` with the ListboxItem visual anatomy), and DOM focus moves to those item buttons when the Popover opens. The trigger does NOT carry `role="combobox"` — that pattern is reserved for the separate Combobox component (which supports typeahead filtering). The most common misuse is borrowing Input's semantics along with its chrome and reaching for `role="combobox"` or `aria-activedescendant`. Dropdown does neither.

---

# Dropdown

## Spec

### Dependencies

- **Input** (`flex-components:input`) — trigger _chrome_ only. The trigger renders as a `<button type="button">` element styled with Input's Outline/Underline stroke, Size-driven padding/typography/radius, and stroke-on-Focus pattern. Input properties that don't apply to a non-editable trigger (placeholder typing, caret, read-only) are not consumed.
- **Popover** (`flex-components:popover`) — floating surface for the option list. Provides surface fill, radius, shadow, light-dismiss, and runtime positioning. The Popover here carries no special ARIA role — it is a presentational floating container.
- **ListboxItem** (`flex-components:listbox-item`) — selectable rows rendered directly inside the Popover. Each row is a `<button type="button">` with `aria-pressed` carrying selection state. Multiple-mode rows transitively depend on `flex-components:checkbox` for the presentational trailing checkbox.

---

### Anatomy

1. **Trigger** — `<button type="button">` element styled with Input's chrome. Owns the value/placeholder display, the optional leading slot, and the trailing chevron. This is the only directly-focusable element in Dropdown's Closed state.
2. **Leading slot** — optional icon, avatar, or other identity affordance preceding the value text. Mirrors Input's `Icon Start` slot; matches the Size axis (16/20/24 px).
3. **Value display** — text node showing the current selection (Single mode), comma-separated selections or a count (Multiple mode), or the placeholder when no value is set.
4. **Trailing chevron** — required ChevronDown icon indicating that activating the trigger opens an overlay. Rotates 180° (or swaps to ChevronUp) when Open=true. Size matches the Size axis (16/20/24 px).
5. **Popover surface** — `flex-components:popover` instance containing the item rows. Provides background, radius, shadow, light-dismiss, and positioning relative to the trigger.
6. **Item rows** — `flex-components:listbox-item` instances rendered directly inside the Popover. Each row is a `<button type="button">` carrying its own DOM focus and `aria-pressed` state. There is no intermediate listbox container.

| Slot             | Required        | Default          |
| ---------------- | --------------- | ---------------- |
| Trigger          | Yes             | —                |
| Leading slot     | No              | Hidden           |
| Value display    | Yes             | Placeholder text |
| Trailing chevron | Yes             | ChevronDown      |
| Popover surface  | Yes (when Open) | —                |
| Item rows        | Yes (when Open) | —                |

> **Trigger element semantics:** The Trigger is a `<button>` element. It does not accept text input, does not carry `role="combobox"`, and the popup does not carry `role="listbox"`. If filtering is needed, use Combobox (a separate component built on a real `<input>` with typeahead) — that's where the combobox ARIA pattern lives.

---

### Variants

Variant properties are ordered in the design tool: **Style → Size → Selection mode → State → Open**.

#### Style

| Value         | Description                                                                    | When to Use                                                                                        |
| ------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| **Outline**   | Full-border trigger styled like Input Outline. Default for most form contexts. | Default. Matches Input Outline siblings in the same form.                                          |
| **Underline** | Bottom-edge stroke styled like Input Underline.                                | When the surrounding form uses Underline-style Inputs. Style consistency, not a separate use case. |

**Why forward both styles from Input:** Dropdowns commonly live alongside Inputs in a form. Mismatched chrome (Outline Dropdown next to Underline Inputs) reads as a bug. Mirroring Input's Style axis keeps the form visually unified. The underlying interaction model (Button + Popover with focusable item buttons) is unchanged across both styles.

#### Size

| Value      | Description                               | When to Use                                |
| ---------- | ----------------------------------------- | ------------------------------------------ |
| **Small**  | 24px expected height. Icon 16px.          | Dense tables, compact filter rows.         |
| **Medium** | 32px expected height. Icon 20px. Default. | Standard form fields.                      |
| **Large**  | 40px expected height. Icon 24px.          | Touch-first or large-density-low surfaces. |

**Why forward all three sizes from Input:** Same rationale as Style — dropdowns sit next to Inputs and must match their density. Item row size is not affected — the rows render at ListboxItem's standard density regardless of trigger size.

#### Selection mode

| Value        | Description                                                                                                                                                                                                                                                                                                                                                                                                 | When to Use                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Single**   | One option may be selected at a time. Value display shows the chosen option's label (or placeholder). Activating an option commits the value and closes the Popover. The chosen row carries `aria-pressed="true"`; all others carry `aria-pressed="false"`.                                                                                                                                                 | Default. Most dropdowns — picking one of N values. |
| **Multiple** | Any number of options may be selected. Value display shows a comma-separated list or a count ("3 selected"). Activating an option toggles its `aria-pressed` state; the Popover stays open until light-dismiss. Each row renders an embedded Checkbox (label-hidden, square style) in its trailing slot as a presentational selection indicator — the row's `aria-pressed` carries the selection semantics. | Filters, tag pickers, bulk-action selections.      |

**Why Selection mode is exposed on Dropdown:** Selection mode changes the trigger's value display (single label vs multi-value summary), the close-on-activate behavior, and the per-row anatomy (Checkmark vs Multiselect checkbox). All three decisions need to be visible at the Dropdown level — it would be confusing to have to look into the row spec to determine how the trigger renders.

> **Multiple-mode trigger display:** Designers choose one of three patterns at implementation:
>
> 1. Comma-separated labels (e.g. "Mona, Allan, Robin") — best for short labels and small selection counts.
> 2. Count summary (e.g. "3 selected") — best when selections may be many or labels long.
> 3. Token strip (each selection rendered as a Tag inside the trigger) — best when selections must be individually dismissable from the trigger itself. Requires the trigger to be vertically expandable.
>
> All three are valid; pick one per Dropdown instance and stay consistent within a form.

#### State

| Value        | Applies         | Visual                                                                                                                           |
| ------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Rest**     | Closed and Open | Default trigger stroke per Style                                                                                                 |
| **Hover**    | Closed and Open | Stroke uses the inline hover value from `tokens.yaml`                                                                            |
| **Pressed**  | Closed          | Transient — momentary depression during click                                                                                    |
| **Focused**  | Closed and Open | Trigger stroke swaps to `--gnrc-color-stroke-neutral-heavy` (matches Input's focus pattern, not the universal dual-outline ring) |
| **Disabled** | Closed only     | Trigger uses Input disabled tokens; not openable                                                                                 |
| **Error**    | Closed and Open | Trigger stroke swaps to `--gnrc-color-stroke-danger-loud` (matches Input Error)                                                  |

**Why forward Input's State pattern (stroke-only):** Input does not use the universal dual-outline focus ring — it swaps the boundary stroke instead. Dropdown's trigger uses the same model for visual continuity. The focused item button inside the Popover uses the universal dual-outline ring on `:focus-visible` (via `flex-components:listbox-item`) — the trigger and the items use different focus-ring patterns because they are different surface tiers.

> **Read only is not modeled.** Dropdowns don't have a meaningful read-only state — if the user can't change the value, render the value as static text. If a "look like a dropdown but can't change" affordance is genuinely needed, set State=Disabled instead.

#### Open

| Value     | Description                                                                                                                                                                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **false** | Trigger is shown; Popover is not rendered. ChevronDown trailing icon. Default.                                                                                                                                                                                                         |
| **true**  | Trigger remains visible; Popover is mounted and positioned relative to the trigger; item rows render directly inside the Popover. DOM focus moves into the Popover (to the currently-selected row, or to the first row if no selection). Chevron rotates 180° (or swaps to ChevronUp). |

**Why Open is a variant axis rather than purely runtime:** Open=true is a documentable design state — designers need to specify the Popover's surface tokens, the row that receives initial DOM focus, and the chevron rotation. Modelling it as a Figma variant axis makes the Open state explicit; runtime code still drives the actual open/close transition.
