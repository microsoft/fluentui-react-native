---
name: breadcrumb
platform: react-native (Windows, macOS)
description: Molecular navigation trail that shows a user's hierarchical location; covers interactive BreadcrumbItem (extends Button Subtle), non-interactive CurrentItem, Separator, Overflow (Visible/Collapsed with Popover), Tooltip (overflow count + truncated labels), and Small/Medium/Large sizes.
argument-hint: "[variant axis or behavior question, e.g. 'What token does CurrentItem use?' or 'When should Collapsed overflow be used?']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value      |
| --------- | ---------- |
| Type      | molecular  |
| Component | Breadcrumb |

This spec covers the Breadcrumb component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. BreadcrumbItem is a Button instance (Subtle style); treat its size, focus ring, hover/pressed, and typography tokens as fully delegated to Button — do not redeclare them unless a value diverges. CurrentItem is never interactive and must never receive hover, pressed, or focus-ring treatment.

---

# Breadcrumb

## Spec

## Dependencies

- **Button** (`flex-components:button`) — BreadcrumbItem is a Button instance at Subtle style (Icon and text layout, or Icon only for the OverflowButton). Size axes map 1:1. Interaction states, focus ring, typography, padding, and icon slots all delegate to Button.
- **Popover** (`flex-components:popover`) — the overflow Popover surface. Activated by the OverflowButton in the Collapsed variant; all container tokens (surface, stroke, radius, shadow, elevation) come from Popover.
- **Menu / MenuItem** (`flex-components:menu`, `flex-components:menu-item`) — the overflow Popover's content. Hidden middle items render as MenuItem List Item instances; container padding follows Menu's override of Popover padding.
- **Tooltip** (`flex-components:tooltip`) — surfaces two types of contextual labels: (1) an item-count preview on hover/focus over the OverflowButton before the Popover is opened; (2) the full label of a truncated BreadcrumbItem on hover/focus.

---

### Anatomy

1. **Container** — outer `<nav>` landmark wrapping an `<ol>` list. Sets the horizontal flex layout, controls the gap between items and separators, and owns the overflow display logic (shows or hides the OverflowButton and middle items).
2. **BreadcrumbItem** — an interactive navigation element that extends Button (Subtle style, Icon and text layout). Owns its focus ring, hover/pressed states, and an optional leading icon slot. Represents each ancestor page in the navigation hierarchy. In web implementations, renders as `<a>` when an `href` is provided (preferred for true navigation) or `<button>` when triggering in-app routing — this is a rendering concern, not a design-system distinction.
3. **CurrentItem** — the non-interactive final item representing the current page. Shares the same font size as BreadcrumbItem for its size but renders in Semibold (Strong) weight to signal current location. Has no hover, pressed, focus, or disabled states.
4. **Separator** — a visual-only chevron icon placed between each item in the trail. Non-interactive, non-focusable, and non-tabbable. Renders in a tertiary foreground weight to subordinate it to item labels.
5. **OverflowButton** — an Icon-only Button (Subtle style) that appears in the Collapsed overflow variant to represent hidden middle items. Uses an ellipsis icon. Interactive and focusable. Shows a Tooltip on hover/focus indicating how many items are hidden; activating it opens the overflow Popover.
6. **Overflow Popover** — a Popover anchored to the OverflowButton presenting hidden middle items as MenuItem List Items. Light-dismisses on item activation, Escape, click outside, or Tab out.

| Slot                              | Required                    | Default                       |
| --------------------------------- | --------------------------- | ----------------------------- |
| BreadcrumbItem (one or more)      | Yes                         | —                             |
| CurrentItem                       | Yes                         | —                             |
| Separator (generated per gap)     | Yes                         | Chevron right icon            |
| Leading icon (per BreadcrumbItem) | No                          | Hidden                        |
| OverflowButton                    | No — Collapsed variant only | Ellipsis (•••) icon           |
| Overflow Popover                  | No — Collapsed variant only | MenuItem list of hidden items |

---

### Variants

Variant properties are ordered in the design tool: **Overflow → Icon → Size → State**.

#### Size

| Value      | Description                                                                  | When to Use                                                             |
| ---------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Small**  | Compact trail matching Button Small proportions (25px row height)            | Dense surfaces, toolbars, and page headers with limited vertical rhythm |
| **Medium** | Default. Standard trail matching Button Medium proportions (32px row height) | General-purpose across all surfaces                                     |
| **Large**  | Expanded trail matching Button Large proportions (38px row height)           | High-touch surfaces and page headers with generous vertical rhythm      |

**Why sizes delegate entirely to Button:** BreadcrumbItem IS a Button instance. Using the same Size axis values means padding, typography, and icon sizes are inherited rather than redeclared. The breadcrumb container only owns the gap between items — all per-item dimensions come from Button.

#### Overflow

| Value         | Description                                               | When to Use                                                                                                       |
| ------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Visible**   | All items in the trail are displayed in full              | Default; use when the trail is short or horizontal space is sufficient                                            |
| **Collapsed** | Middle items are hidden and replaced by an OverflowButton | Use when the trail is too long to fit the available width; always keep the first and last (Current) items visible |

**Why Overflow is a variant axis rather than a CSS-only state:** Collapsed and Visible require structural changes to the component — items are removed from the rendered tree and the OverflowButton is added. This cannot be toggled with CSS alone and must be represented as a distinct variant in the design tool.

#### Icon

| Value            | Description                                 | When to Use                                                                                     |
| ---------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Without icon** | BreadcrumbItems show label only             | Default; most navigation contexts do not require icons                                          |
| **With icon**    | BreadcrumbItems include a leading icon slot | Use only when each linked page has a strongly recognizable icon (e.g. home, settings, document) |

**Why Icon is a trail-level axis and not per-item:** All items in a breadcrumb trail should be iconically consistent — mixing icon and no-icon items in the same row creates uneven horizontal rhythm. This variant governs icon slot visibility across the entire trail, not per individual item.

#### State

Applies per-BreadcrumbItem. CurrentItem only surfaces the **Current** value; all other state values are unavailable to it.

| Value        | Description                                                                               |
| ------------ | ----------------------------------------------------------------------------------------- |
| **Rest**     | Default non-active state                                                                  |
| **Hover**    | Pointer over a BreadcrumbItem; background uses the delegated Button interaction value     |
| **Pressed**  | BreadcrumbItem is being activated; background uses the delegated Button interaction value |
| **Disabled** | BreadcrumbItem is present in the trail but cannot be activated                            |
| **Current**  | The final item in the trail — non-interactive, Semibold weight, no focus ring             |

**Why Current is in the State axis rather than a separate component:** Current is a structural constraint (always exactly one, always last) with distinct visual treatment (Semibold, no interaction). Encoding it in the State axis rather than as a separate sub-component keeps the variant set unified and avoids maintaining an independent CurrentItem component set.
