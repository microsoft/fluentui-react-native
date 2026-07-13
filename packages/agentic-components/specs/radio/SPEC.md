---
name: radio
platform: react-native (Windows, macOS)
description: Molecular single-select control for choosing exactly one option from a group of mutually exclusive choices. Binary status (Unselected/Selected) with a circular indicator, a required label, and an optional secondary description text.
argument-hint: "[variant axis or behavior question, e.g. 'when to use Radio vs Checkbox']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | molecular |
| Component | Radio |

This spec covers the Radio component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. Two distinctions matter most: Radio is single-select within a group (use Checkbox when zero, one, or many selections are valid), and Radio always carries a visible label — there is no label-off variant. The label foreground intentionally shifts between statuses — unselected labels use secondary to de-emphasize unchosen options, while selected labels use primary to highlight the active choice in a group.

The label is composed from `flex-components:label` — Label provides the text node, typography, and native `<label for>` association behavior. Radio applies a Status-driven foreground override on top of the composed Label, because Label's Rest/Disabled state model does not model selection.

Radio also supports an optional **secondary text** slot beneath the primary label. Secondary text provides additional descriptive context for an option (e.g. explaining what the choice entails) without overloading the primary label. It is hidden by default and toggled via a boolean property.

---

# Radio

## Spec

### Anatomy

1. **Root container** — auto-layout row; owns the gap between the indicator and the label area, and via the native `<label>` association is itself the click/tap target for the entire row.
2. **Indicator** — 16×16 circular ring; owns the visible stroke outline, circular border radius, and a transparent fill. The fill is transparent on both Status values — Selected is signaled by the appearance of the indicator dot inside the ring, not by a fill swap. Carries its own margin for visual breathing room (see `spacing.indicator.margin`, which also documents how the margin counts toward the WCAG 2.5.5/2.5.8 hit-target minimum).
3. **Indicator dot** — 10×10 filled inner circle, visible when Selected and hidden when Unselected. Uses brand foreground on Selected (mirrors Checkbox's brand emphasis on Checked) and rides the brand lightness curve on hover/pressed independently of the label, which stays on the neutral curve.
4. **Label container** — auto-layout column that offsets the label text and optional secondary text vertically relative to the indicator center. When secondary text is hidden, the container holds only the label and behaves identically to the previous single-node wrapper.
5. **Label** — composed instance of `flex-components:label` displaying the radio label. Always visible — Radio cannot be rendered without a label. Pinned variants: `Weight=Regular`, `Size=Medium`, `Required=Off`. Radio does not expose these as its own variants because Radio has no Size axis and required-at-the-group-level is a RadioGroup concern. The Label sub-component sources the text node, typography, and `<label for>` association; Radio overrides the foreground per Status (see Status rationale below) and propagates its Disabled state into Label's Disabled state.
6. **Secondary text** — optional text node beneath the label displaying supplementary description. Hidden by default via the Secondary text boolean property. Uses `textstyle-functional-body-small` (one step smaller than the primary label) and stays at secondary foreground regardless of Status — the description is always supporting text and does not shift emphasis on selection. On web, wired to the `<input>` via `aria-describedby` so screen readers announce it as supplementary context after the label name.

| Slot | Required | Default |
|------|----------|---------|
| Label | Yes | Visible ("Label") |
| Secondary text | No | Hidden |
| Indicator dot | Structural | Determined by Status variant — not user-swappable |

---

### Variants

Variant properties are ordered in the design tool: **State → Status**. State is the interaction axis and Status is the selection axis — placing Status last matches the system convention that selection state is the trailing variant axis (`Layout → Style → Size → State → Selected`). Radio has no Style or Size axis — the indicator is always circular, and there is a single size.

#### State

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Rest** | Default idle appearance | No user interaction |
| **Hover** | Cursor is over the component | Web only — mouse pointer enters the hit area |
| **Pressed** | Active press/tap | Momentary state during click or touch |
| **Disabled** | Non-interactive | When the option is unavailable in the current context |
| **Focus** | Keyboard focus ring visible | When the component receives focus via keyboard navigation |

#### Status

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Unselected** | Empty circular indicator — option is not chosen | Default state for non-active options in a group |
| **Selected** | Inner dot present — option is the active choice | When someone has selected this option from the group |

**Why Status is binary:** Radio represents single-select within a mutually exclusive group — there is no third state. A boolean axis maps cleanly to `aria-checked="true|false"`. The Indeterminate state that exists on Checkbox does not apply here because a radio group always resolves to exactly one selected option (or none, before any choice is made).

**Why Radio still owns the label foreground shift:** The composed Label sub-component only models Rest and Disabled — it has no concept of selection. The secondary→primary foreground change between Unselected and Selected is a Radio-level concern (it communicates which option in the group is active), so Radio applies it as a foreground override on the composed Label rather than asking Label to grow a Status axis. Label remains the source of truth for the label's typography and association behavior; Radio remains the source of truth for the label's foreground color across Status.

**Why Hover and Pressed are inline values:** Interaction states are resolved from each active rest token in `tokens.yaml`. This keeps the component spec self-contained while preserving separate hover/pressed combinations across statuses.

**How interaction applies to Radio:**
- **Stroke** — `neutral-heavy` outline on Unselected; `brand-loud` outline on Selected. Both have explicit hover/pressed values in `tokens.yaml`.
- **Foreground** — the indicator dot uses `brand-primary` on Selected and rides the brand lightness curve on hover/pressed. The label foreground stays neutral and shifts per Status (secondary → primary on Selected) and per interaction state.
- **Background** — transparent on both Status values and has explicit hover/pressed values in `tokens.yaml`.
