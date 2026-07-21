---
name: interaction-tag
platform: react-native (Windows, macOS)
description: Molecular interactive labeling element that extends Tag with a primary action area and a secondary dismiss action. Supports leading content (icon or Avatar, never both), two styles (Secondary/Primary), two sizes, and two corner shapes (Rounded/Circular).
argument-hint: "[variant axis or behavior question, e.g. 'primary action area tokens' or 'independent hover behavior']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value           |
| --------- | --------------- |
| Type      | molecular       |
| Component | Interaction Tag |

This spec covers the Interaction Tag component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is confusing Interaction Tag with Tag — Tag is a single-action dismiss-only element; Interaction Tag has a separate primary action area (whose action is context-dependent) and a secondary dismiss action. Do not use Interaction Tag for tags without a primary action; use Tag instead. Do not use media (Avatar) together with an icon on one Interaction Tag.

---

# Interaction Tag

## Spec

## Dependencies

- **Tag** (`flex-components:tag`) — inherits visual language, sizing scale, the Secondary/Primary style pair, corner-shape options, and dismiss icon conventions
- **Avatar** (`flex-components:avatar`) — optional leading content slot when representing a person or entity

---

### Anatomy

1. **Container** — auto-layout root frame; owns border radius, background fill, and overall shape. Contains the primary action area and secondary action. The container itself is not a single interactive element — it houses two distinct interactive regions.
2. **Primary action area** — the main clickable region encompassing the leading content and label. Triggers a context-dependent action (e.g., opening a person card popover, navigating to a profile). Rendered as a `<button>` element.
3. **Leading content** — an optional media slot. The media type (None, an icon, or an Avatar) is a **variant axis**, not an instance-swap property: each type is baked into its own variant. Because the type is a variant, an icon and an Avatar can never appear together. The icon is a Fluent Iconography instance (Regular style) tinted to the foreground; the Avatar is an Avatar instance (Image content). Hidden in the `None` variant.
4. **Label** — text node bound to the `Label string` component property.
5. **Divider** — vertical 1px stroke between the primary action area and the secondary action. Provides a visible boundary that communicates the presence of two separate interactive regions.
6. **Secondary action** — a separate interactive dismiss button at the trailing end. Rendered as an independent `<button>` element with its own focus target. Contains the Dismiss icon. Minimum width of 24px to meet WCAG 2.5.8 target size.
7. **Dismiss icon** — trailing Fluent Iconography instance (Dismiss/Regular) inside the secondary action area.

| Slot            | Required                   | Default    |
| --------------- | -------------------------- | ---------- |
| Label           | Yes (Icon and text layout) | "Tag text" |
| Leading content | No                         | Hidden     |
| Dismiss icon    | Yes                        | Shown      |

> **Two interactive elements:** Unlike Tag (single `<button>`), Interaction Tag contains two focusable regions — the primary action area and the secondary dismiss button. Each receives its own focus ring and interaction states independently.

> **Media exclusivity:** Leading content is either an icon OR an Avatar — never both. This is enforced by the `Leading content` variant axis (None / Icon / Avatar): each media type is baked into its own variant rather than swapped at runtime, so the invalid icon-plus-Avatar combination cannot be expressed. Baking per variant (instead of an instance-swap slot) also avoids Figma's swap pitfalls — swapping between the heterogeneous icon and Avatar masters reset the slot size and dropped the icon's color override. This prevents visual clutter in a compact labeling element and ensures clear hierarchy between the identity representation and the tag label.

---

### Variants

Variant properties are ordered in the design tool: **Layout → Leading content → Style → Size → Shape → State**.

#### Layout

| Value             | Description                                  | When to Use                                                                              |
| ----------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Icon and text** | Leading content (optional) + label + dismiss | Default for most interactive tagging contexts                                            |
| **Icon only**     | Leading content + dismiss, no label          | Compact contexts where the leading content (avatar or icon) is sufficient identification |

**Why Icon only uses a circular radius:** Same principle as Tag — when the component reduces to icons only, the container becomes compact and a circular pill is the correct affordance. Prevents misreading as a button.

#### Leading content

| Value      | Description                                   | When to Use                                                       |
| ---------- | --------------------------------------------- | ----------------------------------------------------------------- |
| **None**   | No leading media — label only                 | Plain interactive tags. Valid only with the Icon and text layout. |
| **Icon**   | A Fluent Iconography glyph precedes the label | Reinforce the tag's category or action with a glyph               |
| **Avatar** | An Avatar precedes the label                  | Represent a person or entity                                      |

**Why leading content is a variant, not a swap:** Icon and Avatar are different master components with different sizing and tinting. Baking each into its own variant guarantees mutual exclusivity and avoids the instance-swap failure mode where swapping between the two masters reset the media size and discarded the icon's color override. `None` is omitted for the Icon only layout — an icon-only tag with no media would be empty.

#### Style

Inherited from Tag — the two action areas and the divider all respond to the active Style.

| Value         | Description                                                                                                                                   | When to Use                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Secondary** | Default. Subtle fill (`background/neutral-subtle`) with neutral-primary foreground (`foreground/neutral-primary`) and a soft neutral divider. | The standard interactive tag surface; suits most scenarios, including dense filter bars or tag lists where heavy fills would create too much visual weight. |
| **Primary**   | Brand-heavy fill with inverted (`neutral-onloud`) foreground and an on-loud divider.                                                          | Higher-emphasis interactive tags where the tag is central to the scenario.                                                                                  |

**Why the divider tracks Style:** The divider must stay visible against whichever surface is active. Secondary uses a soft neutral stroke that reads on the subtle fill; Primary uses the on-loud stroke that reads on the brand-heavy fill.

#### Size

| Value      | When to Use                                           |
| ---------- | ----------------------------------------------------- |
| **Small**  | Dense filter bars, inline tag lists, compact surfaces |
| **Medium** | Default. General-purpose interactive tag usage.       |

**Why two sizes match Tag:** Interaction Tag inherits the Tag sizing scale to ensure visual alignment when the two appear together (e.g., a mix of dismissible-only tags and interactive tags in the same filter bar).

#### Shape

Controls the container corner radius on the **Icon and text** layout. Icon only is always circular regardless of Shape.

| Value        | Description                                                                | When to Use                                                                                         |
| ------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Rounded**  | Default. Size-dependent base radius (`base-200` Small, `base-300` Medium). | Standard rounded-rect interactive tag.                                                              |
| **Circular** | Fully circular radius (`radius-circular`) even with a visible label.       | Pill-shaped interactive tags for a softer, more compact look — e.g., contact chips or filter pills. |

The primary and secondary action areas inherit the resolved container radius on their outer (leading / trailing) sides and stay flat against the divider, so the Shape change applies to the outer corners of the whole tag.

#### State

| Value        | Description                                              |
| ------------ | -------------------------------------------------------- |
| **Rest**     | Default idle state                                       |
| **Hover**    | Pointer over the primary action area or secondary action |
| **Pressed**  | Active press on either interactive area                  |
| **Disabled** | Non-interactive; reduced contrast                        |

> **Independent hover/pressed:** The primary action area and secondary action each respond to hover/pressed independently. When the pointer is over the primary area, only that region shows the hover state; the secondary action remains at rest, and vice versa.
