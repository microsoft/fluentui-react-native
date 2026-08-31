---
name: progress-bar
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# ProgressBar

## Scope

ProgressBar is a non-interactive indicator for the progress of a task or for a
snapshot of a continuous quantity. It renders a header row with a label and an
optional validation icon and value text, above a track containing a fill
indicator.

It supports three modes: a value-driven determinate bar, a looping
indeterminate bar, and a value-driven static bar that never animates. A
three-value status axis recolors the indicator and selects a default validation
icon.

ProgressBar owns no cancel, pause, retry, or dismissal affordance, and it does
not announce outcome messages. It never takes focus and never responds to
pointer or keyboard input. It is not a spinner, a step indicator, or a slider.

## Public contract

### Props and defaults

| Prop                 | Type                                     | Default                | Contract                                                                                                                                       |
| -------------------- | ---------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`               | `determinate \| indeterminate \| static` | `determinate`          | Selects value-driven, looping, or non-animating rendering.                                                                                     |
| `status`             | `neutral \| error \| success`            | `neutral`              | Selects the indicator and validation icon color, and the default validation icon.                                                              |
| `progress`           | `number`                                 | `0`                    | The value, interpreted as a percentage. Missing and non-numeric values resolve to `0` and the value is clamped to the range `0` through `100`. |
| `label`              | `string`                                 | `Label`                | The header text. It is also the accessible name source.                                                                                        |
| `valueText`          | `string`                                 | derived                | Overrides the derived value text.                                                                                                              |
| `showValueText`      | `boolean`                                | `true`                 | Controls whether the value text renders.                                                                                                       |
| `showValidationIcon` | `boolean`                                | `status !== 'neutral'` | Controls whether the validation icon renders.                                                                                                  |
| `validationIcon`     | slot for `Icon`                          | derived from `status`  | Replaces the default icon. `null` removes it.                                                                                                  |

The root accepts the owned `ViewProps` surface. A caller `style` is applied
after the token-derived root style. `accessibilityLabelledBy` supplied by a
caller is preserved and the generated label identifier is appended to it.

Derived value text is the supplied `valueText` when present, otherwise
`Progress failed` for the error status, `Complete` for the success status,
`Working…` for an indeterminate bar, and the resolved percentage followed by a
percent sign otherwise.

### Slots and anatomy

The render order is the root, then the header row containing the label and,
when either is shown, a trailing group holding the validation icon followed by
the value text, then the track containing the indicator.

| Slot             | Rendered when                                                                                         | Contract                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `root`           | always                                                                                                | A `View` that carries progress semantics, the accessible value, and the caller style.                       |
| Header           | always                                                                                                | A row that holds the label and the trailing group.                                                          |
| Label            | always                                                                                                | A non-accessible `Text` that carries the generated identifier the root is named from. It shrinks and wraps. |
| Trailing group   | `showValidationIcon` or `showValueText` resolves true                                                 | A non-shrinking row that can be empty when the icon flag is true but no icon resolves.                      |
| `validationIcon` | the icon flag is true and a custom icon resolves, or status is non-neutral and the slot is not `null` | Sized and colored by the component and hidden from the accessibility tree.                                  |
| Value text       | `showValueText`                                                                                       | A non-accessible `Text` holding the derived or supplied value text.                                         |
| Track            | always                                                                                                | A non-accessible `View` that owns the pill radius, clips the indicator, and reports its measured width.     |
| Indicator        | always                                                                                                | A non-accessible animated `View` absolutely positioned inside the track.                                    |

The label is always rendered and cannot be hidden; there is no bare-track form.
The track and the indicator are internal and are not public slots.

### Requirements

- **PGB-001:** Resolve the documented defaults, clamp the value to the range
  `0` through `100`, resolve a non-numeric value to `0`, and keep the supported
  native root props.
- **PGB-002:** Render the documented order, always render the label, and gate
  the trailing group only when a validation icon slot resolves or value text is
  visible.
- **PGB-003:** Derive the value text from `valueText`, the status, and the type
  in that order, falling back to the resolved percentage.
- **PGB-004:** Size the indicator from the measured track width: the resolved
  fraction of the track for determinate and static, and a fixed segment for
  indeterminate.
- **PGB-005:** Run the looping indeterminate translation only for an
  indeterminate bar with a measured track and reduced motion off, and stop the
  loop and reset the offset otherwise.
- **PGB-006:** Expose progress semantics that are not focusable, name the bar
  from the label through the generated identifier while preserving a caller
  identifier list, publish the bounded value for determinate and static, and
  publish a busy state with no value for indeterminate.
- **PGB-007:** Resolve the track, indicator, label, value text, and validation
  icon values from theme tokens with the indicator and the validation icon
  sharing one status color, and apply the caller `style` last.

## Platform behavior

Windows and macOS render the same structure. The root sets `focusable={false}`
and no press, hover, or focus handlers are attached, so ProgressBar never enters
the tab order and has no focus visual on either platform.

The indicator is measured, not proportioned by layout: the track reports its
width on layout and the indicator width is computed from that number. Before the
first layout pass the indicator width is zero, so the bar renders empty for one
frame on both platforms.

The indeterminate loop is a two-second linear translation driven on the
JavaScript thread rather than the native driver, because it animates a computed
offset alongside a width that also comes from layout. Reduced motion, reported
by the platform accessibility settings, stops the loop and leaves the segment at
its starting position.

Determinate and static values follow the clamped incoming percentage in either
direction and apply immediately on both platforms; there is no animated width
transition.

## Divergences from Flex

| ID                                  | Disposition    | React Native contract                                                                                                                                                                                                                        | Follow-up                                                                                                  |
| ----------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `progress-bar-value-transition`     | Deferred       | Determinate value changes snap to the new width. The transition intent is carried by web-only style keys that the Windows and macOS renderers ignore, so a determinate bar and a static bar animate identically, which is to say not at all. | Drive the width through an animated value so determinate transitions ease and static changes stay instant. |
| `progress-bar-monotonic-value`      | Resolved       | Determinate and static values follow the clamped incoming value in both directions, including genuine decreases such as freed quota.                                                                                                         | Implemented in `useProgressBar.ts` and covered by value update tests.                                      |
| `progress-bar-header-alignment`     | Resolved       | The label grows into available space and the header distributes its label and trailing group to opposite edges.                                                                                                                              | Implemented in `progress-bar.styles.ts` and covered by layout tests.                                       |
| `progress-bar-status-live-region`   | Not applicable | React Native exposes no live-region primitive here, so a status change to error or success is not announced. The component reports role, name, and value only.                                                                               | None available at the component level. The surrounding surface must announce the outcome.                  |
| `progress-bar-empty-trailing-group` | Resolved       | The trailing group renders only when the resolved validation icon slot exists or value text is visible, so neutral and explicitly null icon cases leave no empty view.                                                                       | Implemented in `renderProgressBar.tsx` and covered by anatomy tests.                                       |

## Conformance

| Requirement | Evidence                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------- |
| PGB-001     | `progress-bar.types.ts`, `useProgressBar.ts`, `progress-bar.types.test.ts`, `progress-bar.test.tsx` |
| PGB-002     | `renderProgressBar.tsx`, `useProgressBar.ts`, `progress-bar.test.tsx`, `progress-bar.stories.tsx`   |
| PGB-003     | `useProgressBar.ts`, `progress-bar.test.tsx`                                                        |
| PGB-004     | `useProgressBar.ts`, `useProgressBarStyles.ts`, `progress-bar.test.tsx`                             |
| PGB-005     | `useProgressBar.ts`, `useProgressBarStyles.ts`, `progress-bar.test.tsx`                             |
| PGB-006     | `useProgressBar.ts`, `renderProgressBar.tsx`, `progress-bar.test.tsx`                               |
| PGB-007     | `progress-bar.styles.ts`, `useProgressBarStyles.ts`, `progress-bar.test.tsx`                        |
