---
name: tag
platform: react-native (Windows, macOS)
description: Atomic dismissible labeling element used to represent keywords, categories, or applied filters. Two styles (Primary/Secondary) across two layout modes (Icon and text/Icon only), two sizes, two corner shapes (Rounded/Circular), and a single-action dismiss model.
argument-hint: "[variant axis or token question, e.g. 'Primary tokens' or 'dismiss accessibility']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | Tag |

This spec covers the Tag component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is confusing Tag with Button — Tag is a labeling control, not an action trigger. Tag is a single dismissible element — clicking anywhere on it removes it. There is no toggle or Selected state.

---

# Tag

## Spec

### Anatomy

1. **Container** — auto-layout root frame; owns padding, border radius, background fill, and gap between children. Acts as a single `<button>` element — clicking anywhere on the tag triggers dismiss.
2. **Leading icon** — optional Fluent Iconography instance (Regular style) before the label (`Icon before` prop). Hidden by default.
3. **Label** — text node bound to the `Label string` component property. Always renders at Regular weight.
4. **Dismiss icon** — trailing Fluent Iconography instance (Dismiss/Regular). Controlled by the `Dismiss` boolean prop. Visually indicates dismissibility but is not a separate interactive element.

| Slot | Required | Default |
|------|----------|---------|
| Label | Yes (Icon and text layout) | "Tag text" |
| Leading icon | No | Hidden |
| Dismiss icon | No | Shown |

> **Single interactive element:** Tag is one `<button>`. The entire surface is the dismiss target. There is no separate toggle region or dismiss sub-button. The container owns padding, gap, corner radius, background, and foreground. Hover/pressed apply an OKLCH lightness shift to the whole surface, derived from the active Style's rest background.

---

### Variants

Variant properties are ordered in the design tool: **Layout → Style → Size → Shape → State**.

#### Layout

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Icon and text** | Leading icon (optional) + label + dismiss icon | Default for most tagging contexts |
| **Icon only** | Leading icon + dismiss icon, no label | Compact or icon-driven contexts where the category is visually represented by the icon |

**Why Icon only uses a circular radius:** When the tag reduces to icons only, the container becomes compact and a circular pill is the correct Atomic affordance. A rounded-rect radius on a near-square frame reads as a button rather than a tag indicator.

#### Style

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Secondary** | Default. Subtle fill (`background/subtle`) with neutral-primary foreground (`foreground/primary`). | The standard tag surface; suits most scenarios, including dense filter bars or tag lists where heavy fills would create too much visual weight. |
| **Primary** | Brand-heavy fill with inverted (`neutral-onloud`) foreground. | Higher-emphasis tags where the tag is central to the scenario. |

#### Size

| Value | When to Use |
|-------|-------------|
| **Small** | Dense filter bars, inline tag lists, compact tables |
| **Medium** | Default. General-purpose tag usage. |

#### Shape

Controls the container corner radius on the **Icon and text** layout. Icon only is always circular regardless of Shape.

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Rounded** | Default. Size-dependent base radius (`base-200` Small, `base-300` Medium). | Standard rounded-rect tag. |
| **Circular** | Fully circular radius (`radius-circular`) even with a visible label. | Pill-shaped tags for a softer, more compact look — e.g., contact chips or filter pills. |
