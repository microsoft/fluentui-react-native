---
name: radio-group
platform: react-native (Windows, macOS)
description: Molecular grouping container for two to five Radio sub-components that present mutually exclusive choices. Owns the group-level accessible name, single-select coordination, and roving tabindex; delegates per-option presentation to Radio.
argument-hint: "[variant axis or behavior question, e.g. 'when to use Vertical vs Horizontal orientation']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | molecular |
| Component | RadioGroup |

This spec covers the RadioGroup component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, roving tabindex) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. RadioGroup is a **layout-and-coordination container** — it owns the group label, the orientation of the option list, inter-option spacing, single-select state coordination, and the roving-tabindex focus model. It delegates all per-option visual styling and interaction states to Radio. Two principles matter most: a RadioGroup must contain two to five Radios (never one, never six or more — exceed five and a different selection pattern is needed), and the Legend slot is always present (the group must announce what is being chosen, even if the Legend is visually hidden in favor of surrounding context).

The Legend is composed from `flex-components:label` (Weight=Strong, Size=Medium) — Label provides the typography, foreground color, and the Required asterisk slot. The HTML element rendered for the Legend is still `<legend>` (when the root is `<fieldset>`) or the text node referenced by `aria-labelledby` (when the root uses `role="radiogroup"`); Label's `<label for>` association mechanism is NOT used at the group level, because group naming is owned by the native fieldset/legend pair or by `aria-labelledby`. Composing Label here means RadioGroup adopts Label's visual treatment and Required behavior, not its label-for-control association.

---

# RadioGroup

## Spec

### Dependencies

- **Radio** (`flex-components:radio`) — Primary child component. Each Radio represents one option in the mutually exclusive set; selection coordination across siblings is owned by RadioGroup. All per-option visual styling and individual interaction states (Hover, Pressed, Focus, Disabled-per-option) are owned by Radio.

---

### Anatomy

1. **Root** — auto-layout container; semantic `<fieldset>` (or `role="radiogroup"` on a non-fieldset element). Owns the group-level orientation and the gap between Legend and the options list. The legend-to-options gap is intentionally larger than the inter-option gap so the Legend reads as a heading for the group rather than another option in the list.
2. **Legend** — composed instance of `flex-components:label` displaying the group label. Pinned variants: `Weight=Strong`, `Size=Medium`. The `Required` slot is exposed as a RadioGroup-level boolean (see Variants below) and passes through to Label's `Required` slot. The semibold weight distinguishes the group heading from individual Radio labels (which compose Label at Weight=Regular). Rendered as semantic `<legend>` when the root is a `<fieldset>`; otherwise rendered as a text node referenced by the group container's `aria-labelledby`. Always present in the anatomy — when visually hidden, the label is still programmatically associated with the group. The composed Label sources typography, foreground, and the Required asterisk; RadioGroup does not override Label's foreground because there is no Status-driven shift at the group level (the Legend is always in its primary foreground at Rest).
3. **Options container** — auto-layout flex container holding the Radio children. Orientation (vertical column vs horizontal row) is determined by the RadioGroup Orientation variant. Owns the gap between adjacent Radio children.
4. **Radio items** — Radio instances added as direct children of the Options container. The container is a single slot that accepts two to five Radios — authors add or remove Radio instances in the slot rather than toggling pre-scaffolded visibility booleans. Selection state across the group is coordinated by RadioGroup so that exactly one (or none, before any choice is made) is Selected at any time.

| Slot | Required | Default |
|------|----------|---------|
| Legend | Yes | Visible ("Group label") |
| Radios | Yes (2–5 instances) | Five Radios with Status=Unselected |

---

### Variants

Variant properties are ordered in the design tool: **Orientation → Required**.

#### Orientation

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Vertical** | Radios stack in a column, one per line | Default for most choice lists — easier to scan and compare options reading top-to-bottom |
| **Horizontal** | Radios sit in a row, side by side | When option labels are very short (one or two words) and horizontal space is constrained, or when the choice reads naturally as a left-to-right axis (yes/no, low/medium/high) |

**Why two orientations:** Orientation is a structural decision that affects reading flow, scan density, and the keyboard mental model (Down/Up vs Left/Right). Splitting it as a variant keeps the Radio child component itself orientation-agnostic — Radio's interaction layer already supports both axis pairs of arrow keys, so the variant is purely about layout.

#### Required

| Value | Description | When to Use |
|-------|-------------|-------------|
| **false (Default)** | Legend renders without the trailing asterisk | Default — most groups are optional or required-state is communicated elsewhere on the form |
| **true** | Legend renders with the trailing required-indicator asterisk | When the group must be answered to submit the form — must be paired with `aria-required="true"` on each child Radio (see `accessibility.md`) |

**Why Required is at the group level:** A RadioGroup is the unit of answering — required state applies to "did the user choose any of these options," not to any individual Radio. Authors mark the whole group required by toggling this slot; the composed Label sub-component renders the asterisk on the Legend. Per-Radio Required has no meaning in a single-select group, which is why Radio pins `Required=Off` on its own composed Label.

**Why Required is a passthrough, not a Radio-level concept:** RadioGroup composes Label for the Legend, and Label already models Required as a first-class boolean. Exposing Required as a RadioGroup variant lets the composed Label's existing asterisk + danger-foreground behavior carry the load without RadioGroup needing to author its own required-indicator anatomy. Required composes independently of Orientation — any group at either orientation can be Required or not.

**Why no State axis (Rest, Hover, Pressed, Disabled, Focus):** All interactive states are owned by individual Radio children. The RadioGroup container has no fill, stroke, or interactive surface — it's a transparent layout-and-coordination wrapper. When a group needs to be entirely unavailable, set each child Radio to Disabled; per-Radio Disabled remains the way to disable options (one, several, or all).
