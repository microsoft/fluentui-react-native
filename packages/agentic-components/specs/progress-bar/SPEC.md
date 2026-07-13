---
name: progress-bar
platform: react-native (Windows, macOS)
description: Non-interactive indicator for task progress or continuous-value snapshots. Covers three Type modes (Determinate, Indeterminate, Static), a three-status semantic palette (Neutral, Error, Success), and optional Label, Value text, and Validation icon slots.
argument-hint: "[variant axis or behavior question, e.g. 'when should I use Indeterminate vs Static?']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | ProgressBar |

This spec covers the ProgressBar component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (animation, reduced motion) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is reaching for **Indeterminate** when the duration is actually knowable — Determinate offers a better experience and should be preferred whenever a percentage can be calculated. The second most common misuse is conflating **Static** with Determinate — Static is for snapshot values that do not advance over time (storage usage, quota fill), and must not animate.

---

# ProgressBar

## Spec

### Anatomy

1. **Container** — root auto-layout column. Holds the Header row and the Bar row. Stretches to fill available width.
2. **Header** — auto-layout row above the bar. Always present. Lays out as `[Label … (gap, flex) … Validation icon, Value text]`.
3. **Label** — text node bound to the `Label string` component property. Required — see "Why the Label is required" in Variants below.
4. **Validation icon** — optional 16px Fluent Iconography instance shown only for Error and Success statuses. Sits immediately before Value text. Color is set per the matching Status (see `tokens.yaml`).
5. **Value text** — optional text node bound to the `Value string` component property. Right-aligned within the Header.
6. **Track** — full-width rail beneath the Header. Owns the bar's pill radius.
7. **Indicator** — fill positioned inside the Track. Width is value-driven for Determinate and Static (percentage of Track width); for Indeterminate it animates across the Track (see `interaction.md`). Color is set per the active Status — see "Why the Indicator uses cross-family token application" in Variants below.

| Slot | Required | Default |
|------|----------|---------|
| Header | Yes | Visible |
| Label | Yes | Visible inside the Header |
| Value text | No | Visible inside the Header |
| Validation icon | No | Hidden; enable for Error / Success when feedback is needed |

> **Indicator color and Status:** The Indicator fill is the only token that changes with Status. The Track stays neutral across all statuses so the bar's affordance is consistent and the color signal is carried by the moving/filled portion alone.

---

### Variants

Variant properties are ordered in the design tool: **Type → Status**.

#### Type

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Determinate (Default)** | Animated indicator whose width reflects a known percentage. | Tasks where progress is calculable — uploads, downloads, multi-step flows. Preferred whenever a percentage exists. |
| **Indeterminate** | Continuously-animated indicator with no fixed width. Communicates "work in flight, duration unknown." | Brief operations where progress cannot be calculated. Switch to Determinate as soon as a percentage becomes available. |
| **Static** | Indicator width reflects a fixed value. No animation. | Snapshots of a continuous quantity — storage capacity, quota fill, score. The value is a state, not a moving target. |

**Why three Type values instead of a boolean `indeterminate`:** Determinate and Static share width-driven rendering but differ in animation behavior — Determinate animates value transitions, Static does not. Collapsing both under a single "determinate" mode would force consumers to disable animation per-instance and obscures the snapshot-vs-progress distinction. Indeterminate has its own rendering path entirely (continuous loop, no value).

#### Status

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Neutral (Default)** | Indicator uses the brand palette. No Validation icon. | Default — task is in progress without success or failure semantics. |
| **Error** | Indicator uses the danger palette. Validation icon (Error Circle Filled) appears in the Header. | Task has failed or cannot complete. Replace the Value text with an error message. |
| **Success** | Indicator uses the success palette. Validation icon (Checkmark Circle Filled) appears in the Header. | Task has completed successfully and the bar is held briefly before dismissal. |

**Why three statuses, not four:** Warning is intentionally omitted. A progress bar is binary at the boundary — it either succeeds or it doesn't. "In trouble but not failed" is a Determinate progress state with neutral semantics; the surrounding context (a MessageBar, helper text) carries the caution signal. See [`flex-components:message-bar`](../message-bar/SKILL.md) for the Warning palette.

**Why Neutral uses brand and not neutral palette:** The brand-colored indicator is the long-standing Fluent default for an in-progress bar — it reads as "live, moving toward completion" without implying any outcome. A neutral-gray indicator would be ambiguous against the Track (also neutral) and would read as inactive.

**Why the Indicator uses cross-family token application:** The Track is a neutral background token and the Indicator is a semantic foreground primary token for each Status. The pairing prioritizes a soft, recessive Track that reads as a quiet rail rather than a high-contrast bar; the visual contrast between page surface, Track, and Indicator does not meet WCAG 1.4.11 (3:1 non-text contrast) on its own — the required Label closes that gap (see "Why the Label is required" below and `accessibility.md` § 1.4.11). A side effect of the cross-family choice: the Indicator and the Validation icon for a given Status render in identical color, which keeps the status signal coherent across both surfaces.

**Why the Label is required:** The Track and Indicator are tuned for a soft, recessive visual — the contrast between page surface, unfilled Track, and filled Indicator is below WCAG 1.4.11's 3:1 non-text contrast threshold. The Label, which meets 1.4.3 text contrast at 4.5:1, is required so the component's identity and current state are perceivable through text. Suppressing the Label removes the accessibility bridge and is not supported — there is no `Label` boolean prop. Value text and Validation icon remain optional and do not carry this responsibility.

**Indeterminate × Status interaction:** Status changes the Indicator's color in all three Types. However, Indeterminate is typically used only with Neutral status — Error and Success are terminal outcomes that imply a known result, which contradicts "duration unknown." If Status becomes Error or Success on an Indeterminate bar, transition to Determinate or Static and hold the final value.

**Why no State axis:** ProgressBar is non-interactive — it announces information but does not respond to pointer or keyboard input. There is no Hover, Pressed, or Focus state. A Disabled state was considered and rejected: when the underlying task is paused or unavailable, hiding the bar or replacing it with surrounding context (e.g. a MessageBar) communicates intent more clearly than dimming. Platform token files omit hover/pressed token entries because ProgressBar owns no hover/pressed token values.
