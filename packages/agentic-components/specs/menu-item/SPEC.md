---
name: menu-item
platform: react-native (Windows, macOS)
description: Atomic interactive option within a menu surface. Covers two styles (List Item and Section Header), secondary content positioning (Right/Under), Selected toggle axis, and optional slots for checkmark, icon, avatar, chevron, and multiselect checkbox.
argument-hint: "[variant axis or token question, e.g. 'Selected=True tokens' or 'Section Header accessibility']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value    |
| --------- | -------- |
| Type      | atomic   |
| Component | MenuItem |

This spec covers the MenuItem component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is treating Section Header as an interactive item — it is a non-interactive label that organizes groups of List Items. The Selected axis communicates "this option is active", not "this item was clicked" — use it for persistent selection state, not momentary feedback.

---

# MenuItem

## Spec

### Anatomy

1. **Container** — auto-layout root frame; horizontal row layout with start-aligned labels. Owns padding, border radius, background fill, and gap between children.
2. **Icon** — optional 20px Fluent Iconography instance. Regular at rest; Filled when Selected=True. Shown by default. When Secondary content position is Under, the icon aligns to the top of the primary label rather than vertically centering against the full item height.
3. **Avatar** — optional 16px avatar slot. Mutually exclusive with Icon in practice.
4. **Label** — text node bound to the `Item string` component property. Uses the font-weight swap pattern: Selected=False renders Regular; Selected=True renders Semibold.
5. **Secondary content** — optional text node bound to the `Secondary string` property. Position controlled by the Secondary content position variant (Right or Under).
6. **Chevron** — optional 20px ChevronRight icon indicating a submenu. Shown when `Chevron` prop is true.
7. **Checkmark** — optional 16px icon indicating single-select selection state. Positioned trailing (right side), after the chevron slot — aligned with the Multiselect checkbox zone so all selection indicators occupy the same trailing region. Shown when `Checkmark` prop is true.
8. **Multiselect checkbox** — optional `flex-components:checkbox` instance positioned trailing (right side), after the checkmark slot. Shown when `Multiselect` prop is true. Checkmark and Multiselect are mutually exclusive and share the same trailing zone. Uses square style, label hidden. The Checkbox Status maps to the MenuItem's Selected axis: Selected=True → Checked, Selected=False → Unchecked. The Checkbox uses its standard standalone styling (brand-heavy fill, onLoud indicator when Checked). **The MenuItem row itself does not apply its own selected styling when Multiselect is active** — no soft background fill, no Semibold label weight. The checkbox independently communicates the selection state. The icon swap (Regular→Filled on Selected=True) still applies — it is driven by the Selected axis universally, regardless of selection pattern.

| Slot              | Required              | Default     |
| ----------------- | --------------------- | ----------- |
| Label             | Yes (List Item style) | "Menu item" |
| Icon              | No                    | Shown       |
| Avatar            | No                    | Hidden      |
| Secondary content | No                    | Shown       |
| Chevron           | No                    | Hidden      |
| Checkmark         | No                    | Hidden      |
| Multiselect       | No                    | Hidden      |

> **Font-weight swap:** A ghost Semibold node reserves layout width at opacity 0; a visible Regular or Semibold node renders on top. Selected=False shows Regular, Selected=True shows Semibold. This prevents container width reflow on selection.

---

### Variants

Variant properties are ordered: **Secondary content position → Style → State → Selected**.

#### Style

| Value              | Description                                                                    | When to Use                                                |
| ------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **List Item**      | Interactive option row with icon, label, secondary content, and optional slots | Default for all actionable or selectable menu entries      |
| **Section Header** | Non-interactive group label                                                    | To introduce a group of related List Items within the menu |

**Why Section Header is a Style variant, not a separate component:** Section Header shares the same container structure, padding, gap, and radius tokens as List Item. Making it a Style variant keeps the component set unified and ensures layout consistency within the menu.

#### State

| Value        | Applies to                | Visual                                                                         |
| ------------ | ------------------------- | ------------------------------------------------------------------------------ |
| **Rest**     | List Item, Section Header | Default appearance                                                             |
| **Hover**    | List Item only            | Transparent-hover background tint; foreground shifts via interaction algorithm |
| **Pressed**  | List Item only            | Deepened background tint; foreground shifts via interaction algorithm          |
| **Disabled** | List Item, Section Header | Disabled foreground color; no interaction                                      |
| **Loading**  | Section Header only       | Skeleton shimmer placeholders replace icon and label                           |

**Why Loading exists only on Section Header:** Loading represents the entire menu content being fetched. The Section Header skeleton signals structure while items load. Individual List Items do not have a Loading state — they are either present or absent.

#### Selected

| Value     | Visual                                                            |
| --------- | ----------------------------------------------------------------- |
| **False** | Transparent background; Regular weight label                      |
| **True**  | Soft background fill; Semibold weight label and secondary content |

**Selected is a variant axis, not a State.** It runs in parallel with State — a Hover+Selected=True item is valid. Selected indicates persistent choice, not momentary interaction.

#### Secondary content position

| Value     | Description                                                      | When to Use                                                                                    |
| --------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Right** | Secondary content sits to the right of the label on the same row | Default. Keyboard shortcuts, metadata, counts                                                  |
| **Under** | Secondary content stacks below the label in a column             | When secondary content is longer (email addresses, descriptions) or when vertical space allows |

---

### Related: MenuSplitItem

The **MenuSplitItem** is a companion component that splits the menu item into two independently interactive zones:

1. **Item content** — the primary action area (identical structure to List Item).
2. **Secondary action** — a trailing 44px-wide trigger zone (typically a chevron for submenu access).

Each zone has its own hover state, background, and focus ring. The focus ring on the item content area excludes the secondary action zone. SplitItem shares the same token assignments as List Item for all shared properties.

SplitItem uses the same variant axes as MenuItem (Style, State, Selected, Secondary content position) but adds the independently interactive secondary action zone.
