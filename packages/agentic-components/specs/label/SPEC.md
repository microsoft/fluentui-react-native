---
name: label
platform: react-native (Windows, macOS)
description: Atomic non-interactive text element that names an associated form control. Covers two weights (Regular, the default, for inline-control labels next to Checkbox/Switch/Radio; Strong for Field labels above Input/Select), three sizes, an optional required-asterisk trailing slot, and a Disabled visual state that mirrors its associated control.
argument-hint: "[variant axis or token question, e.g. 'Required asterisk color' or 'Medium label typography']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | Label |

This spec covers the Label component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Label ships in two weights — **Regular** (body weight, the default — for accompanying labels next to Checkbox/Switch/Radio) and **Strong** (semibold, for Field labels above Input/Select). Weight is the only axis that affects emphasis; Size, State, and Required compose independently across both weights.

Answer design questions directly — lead with rationale, then tokens. Label is a non-interactive naming element — it does not own its own focus, hover, or pressed states. It is paired with a form control (Input, Checkbox, Switch, etc.) via programmatic association; the control owns interaction and Label mirrors only the Disabled visual. The most common misuse is treating Label as a generic text style — it carries semantic association behavior (`<label for>` on web) that plain text does not.

---

# Label

## Spec

### Anatomy

1. **Root** — auto-layout row container; owns gap between the label text and the required indicator slot.
2. **Text** — text node displaying the label string. Always visible; carries the primary foreground at Rest and disabled foreground at Disabled.
3. **Required indicator** — text node displaying an asterisk (`*`) after the label. Optional via the Required boolean property; uses danger foreground at Rest to communicate that the associated control must be completed.

| Slot | Required | Default |
|------|----------|---------|
| Required indicator | No | Hidden |

---

### Variants

Variant properties are ordered in the design tool: **Weight → Size → State**.

#### Weight

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Regular (Default)** | Body weight; points to `textstyle-functional-body-{size}` | Inline-control labeling where Label sits next to a self-contained control (Checkbox, Switch, Radio) and reads as accompanying text rather than a field heading. Default because Label is most often used as accompanying text at body weight, and authors opt into the Strong field-heading treatment deliberately |
| **Strong** | Semibold weight; points to `textstyle-functional-body-{size}-strong` | Field labels — the headlining element above an Input, Select, or other control. Use when the label needs semibold emphasis to differentiate from the value inside the control |

**Why two weights:** Label serves two structurally different roles in forms. Above an Input, it is the field's *heading* and needs semibold emphasis to differentiate from the value inside the control. Beside a Checkbox or Switch, it is *accompanying text* that reads as part of the control cluster and uses body weight to sit at the same visual rank as a sentence of prose. Weight changes only the text style mapping — color, gap, slots, and association behavior are identical across both values.

#### Size

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Small** | Compact label height; pairs with Input Small | Dense surfaces: toolbars, data-table inline labels, compact forms |
| **Medium (Default)** | General-purpose label height; pairs with Input Medium | Default for most form contexts |
| **Large** | Prominent label height; pairs with Input Large | High-touch forms, settings pages, contexts requiring larger tap targets |

**Why three sizes match Input sizes:** Label is the headlining element of every Field composition. Aligning Label sizes 1:1 with Input sizes ensures Field at any size composes from a coherent pair — Medium Field uses Medium Label + Medium Input, and so on. Size changes typography and gap only — not semantic emphasis or color.

#### State

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Rest** | Primary foreground; required indicator in danger | Default — label is visible and its associated control is interactive |
| **Disabled** | Disabled foreground across text and indicator | Associated control is disabled — Label mirrors that affordance |

**Why only two states:** Label is non-interactive. Hover and Pressed are not authored because the user never targets Label directly for interaction — clicks on Label forward focus to the associated control (a platform-native behavior of `<label for>`). Focus is also unauthored because Label is never a tab stop. The only state Label needs to express is whether the associated control is interactive (Rest) or not (Disabled).

**Required is a slot, not a state:** The Required indicator visibility is controlled by the Required boolean property, not the State axis. A label can be Required + Rest or Required + Disabled — they compose independently. When Disabled is active, the required asterisk also shifts to disabled foreground; it does not retain its danger color, because the entire field is unavailable.
