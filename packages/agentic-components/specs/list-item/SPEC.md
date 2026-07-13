---
name: list-item
platform: react-native (Windows, macOS)
description: Molecular row inside a List — represents one of a collection of independent, like items. Owns its primary/secondary content, optional leading icon or Avatar, an optional leading selection indicator (Checkbox/Radio driven by the parent List's Selection mode), and an optional trailing action items slot.
argument-hint: "[variant axis or behavior question, e.g. 'Selected font-weight swap' or 'trailing action items contract']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | molecular |
| Component | ListItem |

This spec covers the ListItem component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. ListItem is **a row within a List**, not a standalone control. It owns its own anatomy, tokens, and visual states, but defers collection-level navigation, focus orchestration, and role choice to the parent List. The most common misuse is treating ListItem as an independent control; that bypasses the parent List's contract and breaks consistent activation and selection. Let the parent List provide the interaction model and propagate Size and Selection mode.

---

# ListItem

## Spec

### Dependencies

- **Checkbox** (`flex-components:checkbox`) — leading selection indicator when the parent List's Selection mode = Multiple. Label hidden, square style. Presentational — the row's selection state is authoritative.
- **Radio indicator** — leading selection indicator when the parent List's Selection mode = Single. Label hidden. Presentational — the row's selection state is authoritative.
- **Avatar** (`flex-components:avatar`) — optional leading identity element inside the Leading container (mutually exclusive with the leading Icon).
- **Button** (`flex-components:button`) — icon-only Subtle Button instances inside the Trailing container for Action items (overflow, edit, dismiss).
- **Iconography** — optional leading icon (Regular at rest, Filled when Selected=True) inside the Leading container; icon-only buttons inside Action items.

---

### Anatomy

1. **Container** — auto-layout root frame; horizontal row layout that holds three top-level child groups (Selection slot → Leading container → Primary/Secondary content → Trailing container), each vertically centered against the row. Owns padding, radius, background fill, and the gap rhythm between the major regions. The parent List determines runtime semantics; see the companion platform accessibility guidance.
2. **Selection slot** — leftmost slot reserved for the selection indicator. Hidden when the parent List's Selection mode = None. Renders a label-hidden Checkbox (Multiple) or Radio (Single). Owned by the parent's Selection mode contract, not per-row content. Sits before the Leading container so the selection affordance is the first thing scanned on the left edge of every row.
3. **Leading container** — auto-layout group that wraps the optional leading Icon or Avatar. Hidden when both are off. Sits between the Selection slot and the Primary content slot.
4. **Leading icon** — optional Fluent Iconography instance inside the Leading container. Size per Size axis (16 / 20 / 24 px). Regular at rest; Filled when Selected=True.
5. **Leading avatar** — optional `flex-components:avatar` instance inside the Leading container. Size per Size axis (20 / 32 / 40 px). Mutually exclusive with Leading icon in practice.
6. **Primary content slot** — text node containing the row's primary label, bound to the `Primary string` component property. Uses the font-weight swap pattern: Selected=False renders Regular; Selected=True renders Semibold. Reserves Semibold layout width at all times via a ghost node so the row does not reflow on selection.
7. **Secondary content slot** — optional text node containing supporting metadata. Position controlled by the **Secondary content position** variant (Right or Under). Bound to the `Secondary string` component property. Stays Regular weight across the Selected axis — only the primary label swaps.
8. **Trailing container** — auto-layout group that wraps the optional Action items, right-aligned to the row's trailing edge. Hidden when Action items is off.
9. **Action items** — optional row-trailing slot holding one or more icon-only Subtle Button instances. Independent of the row's primary activation: invoking an action does not toggle the row's selection or trigger the row's primary action. Limit to two visible action buttons per row; collapse the rest into an overflow Menu.

| Slot | Required | Default |
|------|----------|---------|
| Selection slot | No (driven by parent List's Selection mode) | Hidden |
| Leading icon | No | Hidden |
| Leading avatar | No | Hidden |
| Primary content slot | Yes | "List item" |
| Secondary content slot | No | Hidden |
| Action items | No | Hidden |

> **Font-weight swap (primary label only):** A ghost Semibold node reserves layout width at opacity 0 above the primary label; a visible Regular or Semibold node renders on top. Selected=False shows Regular, Selected=True shows Semibold. This prevents container width reflow on selection. Secondary content stays Regular weight across the Selected axis — no swap pattern applies there.

> **Why Selection is its own slot, not part of Leading:** The selection indicator is parent-driven (the List's Selection mode determines whether it renders and which sub-component it is), while the Leading icon/Avatar is per-row content. Separating them keeps independent gap tokens (selection→content vs icon→label), keeps the selection indicator zone structurally distinct from the row's leading identity content, and lets the Selection slot collapse cleanly when Selection mode = None.

---

### Variants

Variant properties are ordered in the design tool: **Size → Selection mode → Secondary content position → State → Selected**.

#### Size

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Small** | Dense row. Icon 16px, Avatar 20px, body-small typography. | Information-dense surfaces (settings panes, sidebars, compact lists in dialogs). Matches Input/Button Small density. |
| **Medium** | Default density. Icon 20px, Avatar 32px, body-medium typography. | Default for most content lists. |
| **Large** | Generous density. Icon 24px, Avatar 40px, body-large typography. | Touch-first contexts, marketing surfaces, or rows with rich secondary content. |

**Why three sizes:** ListItem mirrors the Size axis used by Input, Button, and Dropdown so rows can match the density of the surrounding form context. The parent List forwards Size to every child ListItem — designers do not set it per row.

#### Selection mode

| Value | Description | When to Use |
|-------|-------------|-------------|
| **None** | Selection slot hidden. Row may still be activatable (navigation, drill-in) but carries no persistent selection state. Default. | Default. Pure content rows or navigation rows. |
| **Single** | Selection slot renders a label-hidden Radio. At most one row in the parent List may be Selected=True at a time (enforced by parent). | Single-pick value rows that should remain visible (settings, preferences). |
| **Multiple** | Selection slot renders a label-hidden, square Checkbox. Any number of rows may be Selected=True. | Multi-pick rows (bulk actions, filters). |

**Why Selection mode is mirrored from List:** Selection mode is set on the parent List and propagates to every child ListItem so all rows render consistent indicators. ListItem exposes the axis so designers can preview each indicator in isolation in the design tool — but in product, every row in a single List should share the same Selection mode value.

#### Secondary content position

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Right** | Secondary content sits to the right of the primary label on the same row. Default. | Short metadata (count, timestamp, status, value preview). |
| **Under** | Secondary content stacks below the primary label in a column. | Longer secondary content (descriptions, email addresses, multi-line context) or when extra vertical space is acceptable. |

**Why Right is the default:** Most content rows are scanned vertically and benefit from a tight single-line row. Under doubles the row height — reserve it for descriptive metadata that genuinely aids the row's identification.

#### State

| Value | Applies | Visual |
|-------|---------|--------|
| **Rest** | All rows | Default appearance. |
| **Hover** | Interactive rows only | Background and foreground use the inline hover values in `tokens.yaml`. |
| **Pressed** | Interactive rows only | Background and foreground use the inline pressed values in `tokens.yaml`. |
| **Focused** | Interactive rows only | Universal dual-outline focus ring (see `flex-system:styling`). |
| **Disabled** | All rows | Disabled foreground; no interaction. |

**Why Focused is its own State value:** The parent List moves focus to the row's interactive element. The focus ring is rendered by ListItem itself using the universal dual-outline pattern — the same ring every other focusable element in the system uses.

#### Selected

| Value | Visual |
|-------|--------|
| **False** | Transparent background; Regular weight primary label; selection indicator (if present) reads as "not selected"; leading icon renders Regular variant. |
| **True** | Soft background fill; Semibold weight primary label; selection indicator (if present) reads as "selected"; leading icon renders Filled variant. Secondary content stays Regular weight but promotes to primary foreground for parity with the bolded label. |

**Selected is a variant axis, not a State.** Selected runs in parallel with State — a Hover+Selected=True row is valid. Selected indicates that this row is one of the currently-chosen values (single or multi), not momentary interaction. The Selected styling applies whether the parent uses Single mode (Radio indicator), Multiple mode (Checkbox indicator), or even Selection mode = None (for example, a "current page" navigation row marked via parent state).

> **Selection mode = Multiple suppresses the row-level selected fill.** Mirroring the ListboxItem pattern — when the row carries a visible Multiselect Checkbox, the Checkbox already communicates selection visually, so the row's own soft background fill is redundant and visually noisy. The label's font-weight swap and the leading icon's Regular→Filled swap still apply. Single mode and None mode use the full Selected styling.
