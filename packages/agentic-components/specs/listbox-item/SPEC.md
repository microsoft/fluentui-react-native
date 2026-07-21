---
name: listbox-item
platform: react-native (Windows, macOS)
description: Atomic selectable option row used inside a Dropdown's Popover (or any selection overlay). Mirrors MenuItem anatomy — leading icon or avatar, primary label, Right/Under secondary content, optional checkmark, chevron, and multiselect checkbox slots — but renders as a focusable button with aria-pressed for selection state.
argument-hint: "[variant axis or token question, e.g. 'Selected=True tokens' or 'aria-pressed vs aria-checked']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value       |
| --------- | ----------- |
| Type      | atomic      |
| Component | ListboxItem |

This spec covers the ListboxItem component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. ListboxItem mirrors MenuItem's anatomy and tokens, but they are not interchangeable: ListboxItem represents a candidate value within a single-selection or multi-selection set (`<button>` with `aria-pressed`), while MenuItem represents an action or command within a transient overlay (`role="menuitem"`, transient activation). The most common misuse is reaching for `role="option"` and `aria-selected` (the older listbox-pattern semantics) — that pattern is no longer used in this design system. ListboxItem is a real `<button>` that receives DOM focus and carries `aria-pressed` for selection state.

---

# ListboxItem

## Spec

### Anatomy

1. **Container** — auto-layout root frame; horizontal row layout with two child groups (Leading container and Trailing container), each vertically centered against the option height. Owns padding, border radius, background fill, and gap between the two groups. The container renders as a `<button type="button">` in code.
2. **Leading container** — auto-layout group that wraps Icon (or Avatar) and Label container as a single layer. Vertically centered within the row.
3. **Trailing container** — auto-layout group that wraps Chevron, Checkmark, and Multiselect checkbox as a single layer. Vertically centered within the row, right-aligned to the container's trailing edge.
4. **Icon** — optional 20px Fluent Iconography instance inside the Leading container. Regular at rest; Filled when Selected=True. Shown by default. When Secondary content position is Under, the icon aligns to the top of the primary label rather than vertically centering against the full option height.
5. **Avatar** — optional 32px avatar slot inside the Leading container. Mutually exclusive with Icon in practice.
6. **Label** — text node inside the Leading container bound to the `Item string` component property. Uses the font-weight swap pattern: Selected=False renders Regular; Selected=True renders Semibold.
7. **Secondary content** — optional text node inside the Leading container bound to the `Secondary string` property. Position controlled by the Secondary content position variant (Right or Under).
8. **Chevron** — optional 20px ChevronRight icon inside the Trailing container indicating an expandable option group or nested list. Shown when `Chevron` prop is true. Uncommon in flat lists; reserved for hierarchical option sets.
9. **Checkmark** — optional 16px icon inside the Trailing container indicating single-select selection state. Positioned after the chevron slot — aligned with the Multiselect checkbox zone so all selection indicators occupy the same trailing region. Shown when `Checkmark` prop is true.
10. **Multiselect checkbox** — optional `flex-components:checkbox` instance inside the Trailing container, after the checkmark slot. Shown when `Multiselect` prop is true. Checkmark and Multiselect are mutually exclusive and share the same trailing zone. Uses square style, label hidden. The Checkbox visual Status maps to the ListboxItem's Selected axis: Selected=True → Checked, Selected=False → Unchecked. The Checkbox uses its standard standalone styling (brand-heavy fill, onLoud indicator when Checked). The Multiselect Checkbox is **presentational** — the row's own `aria-pressed` (carried on the container `<button>`) is what assistive technology announces. **The ListboxItem row itself does not apply its own selected styling when Multiselect is active** — no soft background fill, no Semibold label weight. The checkbox independently communicates the selection state. The icon swap (Regular→Filled on Selected=True) still applies — it is driven by the Selected axis universally, regardless of selection pattern.

| Slot              | Required              | Default        |
| ----------------- | --------------------- | -------------- |
| Label             | Yes (List Item style) | "Listbox item" |
| Icon              | No                    | Shown          |
| Avatar            | No                    | Hidden         |
| Secondary content | No                    | Shown          |
| Chevron           | No                    | Hidden         |
| Checkmark         | No                    | Hidden         |
| Multiselect       | No                    | Hidden         |

> **Font-weight swap (primary Label only):** A ghost Semibold node reserves layout width at opacity 0 above the primary Label; a visible Regular or Semibold node renders on top. Selected=False shows Regular, Selected=True shows Semibold. This prevents container width reflow on selection. Secondary content stays Regular weight across the Selected axis — no swap pattern applies there.

---

### Variants

Variant properties are ordered in the design tool: **Secondary content position → Style → State → Selected**.

#### Secondary content position

| Value     | Description                                                      | When to Use                                                                                    |
| --------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Right** | Secondary content sits to the right of the label on the same row | Default. Short metadata such as a value preview, count, or keyboard hint                       |
| **Under** | Secondary content stacks below the label in a column             | When secondary content is longer (email addresses, descriptions) or when vertical space allows |

**Why Right is the default:** Most dropdown values are scanned vertically and benefit from a tight single-line row. Stacking secondary content (Under) doubles the option height — reserve it for descriptive metadata that genuinely aids selection.

#### Style

| Value              | Description                                                                    | When to Use                                                |
| ------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **List Item**      | Interactive option row with icon, label, secondary content, and optional slots | Default for all selectable values in a selection overlay   |
| **Section Header** | Non-interactive group label                                                    | To introduce a group of related options within the Popover |

**Why Section Header is a Style variant, not a separate component:** Section Header shares the same container structure, padding, gap, and radius tokens as List Item. Making it a Style variant keeps the component set unified and ensures layout consistency within the surrounding surface. Section Header is structurally a heading inside the Popover — non-interactive and skipped by keyboard navigation.

#### State

| Value        | Applies to                | Visual                                                                                                              |
| ------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Rest**     | List Item, Section Header | Default appearance                                                                                                  |
| **Hover**    | List Item only            | Transparent-hover background tint; foreground shifts via interaction algorithm                                      |
| **Pressed**  | List Item only            | Deepened background tint; foreground shifts via interaction algorithm                                               |
| **Focused**  | List Item only            | Universal dual-outline focus ring; rendered on `:focus-visible` because the row's `<button>` carries real DOM focus |
| **Disabled** | List Item, Section Header | Disabled foreground color; no interaction                                                                           |
| **Loading**  | Section Header only       | Skeleton shimmer placeholders replace icon and label                                                                |

**Why Loading exists only on Section Header:** Loading represents the entire option list being fetched. The Section Header skeleton signals structure while options load. Individual List Items do not have a Loading state — they are either present or absent.

**Why Focused is a State on the option:** ListboxItem rows receive real DOM focus from the parent Dropdown (arrow keys move focus between row buttons). The Focused state renders the universal dual-outline ring (see `flex-system:styling`) whenever the row's `<button>` matches `:focus-visible` — the same pattern used by every other focusable element in the system.

#### Selected

| Value     | Visual                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| **False** | Transparent background; Regular weight label                                                                     |
| **True**  | Soft background fill; Semibold weight label. Secondary content stays Regular but promotes to primary foreground. |

**Selected is a variant axis, not a State.** It runs in parallel with State — a Hover+Selected=True option is valid. Selected indicates that this is the currently-chosen value (single-select) or one of the chosen values (multi-select), not momentary interaction. Maps to `aria-pressed` on the row's `<button>`.

---

### Used by

ListboxItem is the row inside the **Dropdown** composed component (Input + Popover composition). The parent Dropdown owns keyboard navigation, focus management (moving DOM focus between row buttons), and selection orchestration (which rows are `aria-pressed="true"`, when the Popover closes). ListboxItem owns the row's anatomy, tokens, visual states, and `:focus-visible` ring — but defers DOM focus and selection state to the parent.
