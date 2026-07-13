---
name: checkbox
platform: react-native (Windows, macOS)
description: Molecular selection control with two indicator styles (Standard/Circular), three statuses (Unchecked/Checked/Indeterminate), optional label, optional secondary description text, and status-driven foreground emphasis.
argument-hint: "[variant axis or behavior question, e.g. 'when to use Circular vs Standard style']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | molecular |
| Component | Checkbox |

This spec covers the Checkbox component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most important distinction: Checkbox requires a submission step — it does not trigger an immediate effect. If the user needs an immediate-effect toggle, direct them to Switch. The label foreground intentionally shifts between statuses — unchecked labels use secondary to de-emphasize unselected options, while checked/indeterminate labels use primary.

Checkbox also supports an optional **secondary text** slot beneath the primary label. Secondary text provides additional descriptive context for an option without overloading the label. It is hidden by default and toggled via a boolean property.

---

# Checkbox

## Spec

### Anatomy

1. **Root** — auto-layout row container; owns the gap between the indicator and the label area, and via the native `<label>` association is itself the click/tap target for the entire row.
2. **Indicator** — 16×16px indicator box; owns fill, stroke, and border radius. Shape varies by Style (square vs circular). Carries its own margin for visual breathing room (see `spacing.indicator.margin`, which also documents how the margin counts toward the WCAG 2.5.5/2.5.8 hit-target minimum).
3. **Indicator icon** — checkmark (Checked) or dash (Indeterminate, both Standard and Circular). Hidden when Unchecked.
4. **Text wrapper** — auto-layout column that offsets the label and optional secondary text vertically relative to the indicator center. When secondary text is hidden, the container holds only the label and behaves identically to the previous single-node wrapper.
5. **Label** — text node displaying the checkbox label. Optional via the Label boolean property.
6. **Secondary text** — optional text node beneath the label displaying supplementary description. Hidden by default via the Secondary text boolean property. Uses `textstyle-functional-body-small` (one step smaller than the primary label) and stays at secondary foreground regardless of Status — the description is always supporting text and does not shift emphasis on selection. On web, wired to the `<input>` via `aria-describedby` so screen readers announce it as supplementary context after the label name.

| Slot | Required | Default |
|------|----------|---------|
| Label | No | Visible ("Label") |
| Secondary text | No | Hidden |
| Indicator icon | Structural | Determined by Status variant — not user-swappable |

---

### Variants

Variant properties are ordered in the design tool: **Style → Status → State**.

#### Style

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Standard** | Square indicator with xSmall border radius | Default for most form contexts |
| **Circular** | Fully rounded indicator (circular) | When visual language requires softer, rounded form controls |

**Why two indicator shapes share the same component:** Both shapes use identical token assignments, spacing, touch targets, and interaction behavior — they differ only in border radius. A Style variant avoids duplicating the entire component for a single radius swap.

#### Status

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Unchecked** | Empty indicator — option is not selected | Default state for unselected options |
| **Checked** | Checkmark indicator — option is selected | When the user has actively selected the option |
| **Indeterminate** | Partial indicator (dash) — mixed selection | Parent checkbox in a group where some but not all children are checked |

**Why Status is a separate axis from a binary Selected toggle:** Checkbox supports three selection states (Unchecked, Checked, Indeterminate), not two. A boolean Selected axis cannot represent the Indeterminate state. The tri-state Status axis maps directly to the HTML `indeterminate` property.

#### State

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Rest** | Default idle appearance | No user interaction |
| **Hover** | Cursor is over the component | Web only — mouse pointer enters the hit area |
| **Pressed** | Active press/tap | Momentary state during click or touch |
| **Disabled** | Non-interactive | When the option is unavailable in the current context |
| **Focus** | Keyboard focus ring visible | When the component receives focus via keyboard navigation |

**Why Hover and Pressed are inline values:** Interaction states are resolved from each active rest token in `tokens.yaml`. This keeps the component spec self-contained while preserving separate hover/pressed combinations across statuses.
