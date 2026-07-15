---
name: badge
platform: react-native (Windows, macOS)
description: Atomic non-interactive indicator that communicates a status, count, or category for an associated UI element. Two styles (Outline, Tint), five colors (Brand, Danger, Success, Warning, Informative), two sizes, two shapes, two layouts (Icon and text, Icon only), and independent Leading icon + Trailing icon slots.
argument-hint: "[variant axis or token question, e.g. 'Tint color tokens' or 'why no focus ring']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value  |
| --------- | ------ |
| Type      | atomic |
| Component | Badge  |

This spec covers the Badge component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The two most common misuses are (1) treating Badge as interactive — Badge never receives focus and has no hover or pressed states; if the indicator needs to be actionable, use Button or Tag instead — and (2) using color alone to communicate state, since color is not conveyed to assistive tech. Badge always defers to its host control for interaction and announces through that control's accessible name, not its own.

---

# Badge

## Spec

### Anatomy

1. **Container** — auto-layout root frame; owns padding, border radius, background fill, optional stroke, and gap between children. Non-interactive — does not render a focus ring, does not respond to hover or pressed.
2. **Leading icon** — optional Fluent Iconography instance (Regular style) at the leading edge of the container. Shown when **Layout** is `Icon and text` and the `Leading icon` BOOLEAN component property is true, or unconditionally when **Layout** is `Icon only`. Sized per the **Size** variant (12px at Small, 16px at Medium).
3. **Label** — text node bound to the `Label string` component property. Renders short text — a counter ("1", "999+"), a status word ("New", "Beta"), or a category label ("Engineering"). Only renders when **Layout** is `Icon and text`.
4. **Trailing icon** — optional Fluent Iconography instance (Regular style) at the trailing edge of the container. Shown only when **Layout** is `Icon and text` and the `Trailing icon` BOOLEAN component property is true. Sized per the **Size** variant.

| Slot          | Required                                                                                                         | Default              |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------- |
| Leading icon  | No on `Icon and text` (controlled by `Leading icon` BOOLEAN, default true); structurally required on `Icon only` | Image icon (Regular) |
| Label         | Yes on `Icon and text`; hidden on `Icon only`                                                                    | Badge                |
| Trailing icon | No (controlled by `Trailing icon` BOOLEAN, default false); not rendered on `Icon only`                           | Image icon (Regular) |

> **At least one of Leading icon, Label, or Trailing icon should be visible.** The defaults enforce this in the dropped-in state (Layout=Icon and text, Label string=Badge, Leading icon=true). On `Layout=Icon only`, the Leading icon is structurally always visible. The empty state — Layout=Icon and text with both icon BOOLEANs off and Label string blanked — is reachable but not a default authoring path; authors must actively produce it.

---

### Variants

Variant properties are ordered in the design tool: **Style → Color → Size → Shape → Layout → State**.

#### Style

| Value       | Description                                                    | When to Use                                                                                                                                    |
| ----------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Outline** | Transparent fill, 1px colored stroke, colored foreground       | When the badge sits on a surface whose background already communicates context (a card, an active row) and a fill would over-saturate the area |
| **Tint**    | Soft colored fill, no stroke, colored foreground. **Default.** | General-purpose. Reads as a softly colored chip — strong enough to draw the eye, quiet enough to sit next to body text                         |

**Why Tint is the default and Filled is not offered:** This design system's aesthetic favors lower-contrast surface chrome. A Filled (`*-loud`) Badge competes with primary content and shouts in dense layouts; Tint (`*-soft`) draws the eye without dominating. Filled may be added later if a high-emphasis case emerges.

#### Color

| Value           | Semantic intent                                                               | Token family               |
| --------------- | ----------------------------------------------------------------------------- | -------------------------- |
| **Brand**       | Branded identification — featured, promoted, or branded content. **Default.** | `--gnrc-color-*-brand-*`   |
| **Danger**      | Error, blocker, destructive outcome                                           | `--gnrc-color-*-danger-*`  |
| **Success**     | Confirmation, healthy state                                                   | `--gnrc-color-*-success-*` |
| **Warning**     | Caution, non-blocking issue                                                   | `--gnrc-color-*-warning-*` |
| **Informative** | Quiet, informational metadata — counts, tags, neutral status                  | `--gnrc-color-*-neutral-*` |

**Why Informative maps to neutral:** Flex does not expose an `informative` color family. Informative binds to neutral, which matches the design intent — a quiet, default-informational badge that doesn't pull focus, with Brand carrying the louder, identified case. The variant name stays semantic so the binding can move if an `informative` family is ever introduced to Flex.

#### Size

| Value      | When to Use                                                                  |
| ---------- | ---------------------------------------------------------------------------- |
| **Small**  | Inline with body text, on small icons or avatars (16–24px), in dense rows    |
| **Medium** | Default. Inline with most UI text and on standard icons or avatars (28–40px) |

**Why only two sizes:** v9 ships six (Tiny through Extra-large). This system's v1 trims to the two that cover the dominant inline cases. Dot-only and hero sizes from v9 are out of scope for v1 and can be added if a real use case appears.

#### Shape

| Value        | When to Use                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------- |
| **Circular** | Default. Pill-shaped at any aspect ratio — reads as a true badge indicator                          |
| **Rounded**  | Softened rectangle. Use when adjacent components are rectangular and a pill would feel out of place |

**Why no Square:** Square corners read as a button or tag, not a badge. Removed for clarity of affordance.

#### Layout

| Value             | Renders                                                                                                                                                                                                                          | When to Use                                                                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Icon and text** | Container with optional Leading icon, Label, and optional Trailing icon. Slot visibility is controlled by the `Leading icon` and `Trailing icon` BOOLEAN component properties (defaults: Leading on, Trailing off). **Default.** | The general-purpose Badge. Covers counter Badges (both icon BOOLEANs off → text only), icon-plus-label, label-plus-trailing-icon, and label-bracketed-by-two-icons. |
| **Icon only**     | Container with only the Leading icon slot rendered. Square (`inline-size = block-size`, zero inline padding); icon BOOLEANs are inert.                                                                                           | Status glyph where the icon carries the meaning (a check, a warning sign).                                                                                          |

**Why two Layout values and not three:** Following v9 Figma precedent, Badge uses BOOLEANs for icon slot visibility rather than a separate `Text only` Layout. The `Icon and text` Layout encodes which control surface is exposed (icon slots + label) rather than which slots are currently rendered — toggling `Leading icon` and `Trailing icon` off on `Icon and text` produces a text-only Badge without expanding the variant grid. `Icon only` remains a separate Layout because removing the label structurally changes the container to a square pill with zero inline padding and recalculates spacing.

**Why two icon slots:** Matches the v9 Figma Badge model, which authors are already accustomed to. Common compositions — `Leading=true, Trailing=false` (default icon-and-label) and `Leading=false, Trailing=true` (label with trailing chevron or modifier) — are reachable without an `Icon position` axis. The both-icons case (`Leading=true, Trailing=true`) is supported for parity with v9 Figma; v9 React currently exposes only one icon slot, so two-icon Badges live in the design tool ahead of code.

#### State

| Value    | Description                                                                  |
| -------- | ---------------------------------------------------------------------------- |
| **Rest** | Only state. Badge is non-interactive — no Hover, Pressed, Focus, or Disabled |

**Why Badge has no Disabled state:** Badge has no action to disable. If the host control (Button, ListItem, NavItem) is disabled, the parent's foreground tokens grey out everything inside it including the Badge. Per v9 guidance, Badge does not receive focus and is not a tab stop — adding a Disabled state would imply interactivity that does not exist.
