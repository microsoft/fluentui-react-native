---
name: list
platform: react-native (Windows, macOS)
description: Composed vertical-stack container that groups ListItem components into a scannable collection of independent, like items with optional selection (single via Radio, multiple via Checkbox), trailing actions, and divider separators.
argument-hint: "[variant axis or behavior question, e.g. 'Selection mode tokens' or 'when to use List vs Menu']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | composed |
| Component | List |

This spec covers the List component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. List is a **layout-only container** of independent, like items in a vertical stack — it owns gap, separators, and the selection-mode contract, but delegates all per-row visual styling and interaction states to its child ListItem components. The most common misuse is reaching for List when the items have a relational column structure (use DataGrid or Table) or a nested hierarchy (use Tree). Items in a List are peers — each row stands on its own.

---

# List

## Spec

### Dependencies

- **ListItem** (`flex-components:list-item`) — primary child component. Owns row anatomy (leading content, primary/secondary content slots, trailing actions), per-row interaction states, and typography. List configures Selection mode and Size at the container level; ListItem renders the appropriate selection indicator and content accordingly.
- **Divider** (`flex-components:divider`) — optional horizontal separator between items or item groups. Uses Divider's own tokens — List does not override any Divider styling.

---

### Anatomy

1. **List container** — auto-layout root frame; vertical flex with `items-stretch` alignment. Owns the vertical stack rhythm (gap between rows), the optional Divider placements between items, and the Selection mode contract for child rows. No background fill, no stroke, no padding by default — the surrounding surface provides the background context.
2. **List item** — `flex-components:list-item` instance as a direct child. Carries the row's anatomy and visual states. Multiple items stack vertically inside the List container.
3. **Divider** — optional horizontal separator between items or item groups. Placed between List item rows by the List container.

| Slot | Required | Default |
|------|----------|---------|
| List item | Yes (at least one) | ListItem with Selection mode = None |
| Divider | No | Hidden |

> **List vs Menu vs Dropdown:** List renders inline in the page flow as persistent content. Menu and Dropdown render inside a Popover as transient overlays. If items should disappear after activation, use Menu (actions) or Dropdown (value selection). If items persist on the page and are scanned/selected as content, use List.

---

### Variants

Variant properties are ordered in the design tool: **Size → Selection mode → State → Selected**.

#### Size

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Small** | Dense rows; matches ListItem Small density | Information-dense surfaces (settings panes, side panels, compact lists in dialogs). |
| **Medium** | Standard density. Default. | Default for most content lists (people, files, navigation entries). |
| **Large** | Generous density for touch-first surfaces or hero lists | Touch-first contexts, marketing surfaces, or rows that include Avatars and rich secondary content. |

**Why Size lives on List:** The List container owns the density decision so all child rows render at the same size. List forwards its Size value to every child ListItem — designers do not set Size per row.

#### Selection mode

| Value | Description | When to Use |
|-------|-------------|-------------|
| **None** | No selection indicator on rows. Items may still be activatable (navigation, drill-in) but do not carry a persistent selection state. Default. | Default. Pure content lists, navigation lists, or lists whose items only open a detail view. |
| **Single** | Each row renders a leading Radio. Exactly one row may be selected at a time. | Picking a single value from a set when the choices need to remain visible (settings, preferences). When the choices should collapse after selection, use a Dropdown instead. |
| **Multiple** | Each row renders a leading Checkbox. Any number of rows may be selected. | Bulk selection, filters, multi-pick configurations. |

**Why Selection mode is exposed on List, not per ListItem:** The selection contract is a property of the collection, not the row. Mixing Radio and Checkbox indicators within the same list is incoherent. By exposing Selection mode at the List level, all child rows render consistent indicators and the parent owns the selection orchestration (which row is selected in Single mode, which rows are toggled in Multiple mode).

#### State

| Value | Applies | Visual |
|-------|---------|--------|
| **Rest** | Container, rows | Default appearance |
| **Hover** | Rows only | Row background tint comes from flex-components:list-item. List container does not respond to hover. |
| **Pressed** | Rows only | Row pressed value comes from flex-components:list-item. List container does not respond to pressed. |
| **Focused** | Rows only | Universal dual-outline focus ring on the row's interactive element via flex-system:styling. |
| **Disabled** | Container, rows | Disabled foreground; no interaction. Container-level Disabled disables every row in the list. |

**Why State applies to rows, not the container:** The List container has no fill, stroke, or interactive affordance of its own — there is nothing to render Hover or Pressed against. All interaction states surface on the child ListItem rows. The container-level Disabled is a convenience that cascades disabled to every child row.

#### Selected

| Value | Visual |
|-------|--------|
| **False** | Default — no row is marked as a currently-chosen value. |
| **True** | Applies to rows only. Each Selected=True row carries the parent List's Selection mode indicator state plus ListItem's selected row styling. |

**Selected is a parallel axis to State, not a State value.** A Hover+Selected=True row is valid. Selected indicates a row is one of the currently-chosen values (Single or Multiple modes) or the "you are here" row under None mode — it's not momentary interaction. Per-row Selected styling is owned by `flex-components:list-item`; the List container itself has no Selected visual.
