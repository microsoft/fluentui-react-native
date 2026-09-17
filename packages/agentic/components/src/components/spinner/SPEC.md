---
name: spinner
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Spinner

## Scope

Spinner is an indeterminate progress indicator: a circular track with a
quarter-circumference arc rotating over it, drawn with `react-native-svg` inside
a React Native `View`. It reports that work is in progress when no percentage
is available. Eight fixed sizes cover placement from inline with body text to a
standalone focal indicator.

Spinner is not determinate progress, not a status message, and not a blocking
overlay. It has no text or icon slot, no appearance axis, and no interaction
states: a caller that needs a label composes one next to the spinner and owns
the spacing. It never manages focus and never blocks input by itself.

## Public contract

### Props and defaults

| Prop                      | Type                                                                       | Default  | Contract                                                                                                                             |
| ------------------------- | -------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `size`                    | `x-tiny \| tiny \| x-small \| small \| medium \| large \| x-large \| huge` | `medium` | Selects the diameter and the stroke width token for both circles.                                                                    |
| `accessibilityLabel`      | `string`                                                                   | none     | Names what is loading. Required unless the caller opts the root out of the accessibility tree or supplies `accessibilityLabelledBy`. |
| `accessibilityLabelledBy` | `string \| string[]`                                                       | none     | Points at an adjacent visible label instead of duplicating its text.                                                                 |
| `accessibilityState`      | `AccessibilityState`                                                       | none     | Merged under the component's own busy state.                                                                                         |
| `accessible`              | `boolean`                                                                  | `true`   | Setting `false` hides the root from assistive technology and suppresses the missing-name warning.                                    |
| `pointerEvents`           | `ViewProps['pointerEvents']`                                               | `none`   | Overridable, but the default keeps the indicator out of hit testing.                                                                 |
| `style`                   | `StyleProp<ViewStyle>`                                                     | none     | Applied after the resolved root styles.                                                                                              |

The root accepts the remaining owned `ViewProps`. `role`, the legacy
`accessibilityRole`, and `focusable` are removed from the public surface because the component fixes
both, and `children` is not accepted.

**SPIN-001:** Resolve `size` to its diameter and stroke width token, default to
`medium`, and apply the resolved diameter to both the root box and the drawing
surface.

**SPIN-002:** Expose indeterminate progress semantics on the root, merge caller
accessibility state under the component's busy state, keep the root
non-focusable, and default it out of hit testing.

### Slots and anatomy

| Slot   | Required | Contract                                                                     |
| ------ | -------- | ---------------------------------------------------------------------------- |
| `root` | yes      | A `View` that carries the semantics, the square box, and the caller's style. |

The root has one child, an animated SVG surface that is hidden from assistive
technology and holds the rotation. Inside it the track circle is drawn first and
the indicator arc second, so the arc paints over the track. Both circles share a
center, a radius, and a stroke width, and differ only in color and in the dash
pattern that shortens the indicator to an arc. The drawing surface is not a
public slot; there is no way to replace either circle.

**SPIN-003:** Draw the track first and the indicator second inside a
non-accessible drawing surface, and keep the visible arc at one quarter of the
circumference at every size by normalizing the dash pattern to the path length.

**SPIN-004:** Bind the track and indicator colors and the per-size stroke widths
to theme tokens, and apply the caller's `style` last.

### State ownership

Spinner owns only its rotation clock. There is no value, no completion state,
no hover, press, focus, or disabled state, and nothing for a caller to control.
Mounting the spinner means work is in progress; unmounting it means the work is
over. The component never announces completion.

**SPIN-005:** Warn in development when the root is exposed to assistive
technology without an accessible name.

**SPIN-006:** Rotate the drawing surface a full turn on a continuous linear
loop, hold a static arc while the platform reduced-motion setting is on, and
start no animation until that setting is known.

## Platform behavior

Windows and macOS behave identically. The root is not focusable, is not in the
keyboard tab order, and defaults to `pointerEvents="none"`, so it is never a
keyboard or pointer target and never becomes the initial focus of a dialog.

On Windows the root maps to a UI Automation progress element in the
indeterminate pattern: the busy state is exposed and no current, minimum, or
maximum value is published. On macOS it maps to the equivalent indeterminate
progress element. Narrator and VoiceOver read the accessible name and the busy
state when the element is encountered, and neither platform re-announces the
spinner while it rotates.

The rotation runs on the native driver. The reduced-motion setting is read
asynchronously from the platform, so the first render can occur before the value
is known; the component holds the arc static until it resolves and starts the
loop only when reduced motion is known to be off.

## Divergences from Flex

| ID                           | Disposition    | React Native contract                                                                                                                                                       | Follow-up                                                                          |
| ---------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `spinner-busy-state-on-root` | Accepted       | The single root carries both the progress role and the busy state. Flex treats the role pattern and the busy container pattern as alternatives owned by different elements. | None. React Native has one accessibility node here, so the two cannot collide.     |
| `spinner-instance-timeline`  | Resolved       | Active spinners share one package-level rotation timeline, so instances mounted at different times render at the same phase.                                                | Implemented through the shared animation hook and covered by multi-instance tests. |
| `spinner-adjacent-label-gap` | Not applicable | Spinner has no label slot and publishes no spacing. Flex documents size-stepped gap tokens for a spinner paired with adjacent status text.                                  | None. That spacing belongs to the caller's layout in React Native.                 |

## Conformance

| Requirement | Evidence                                                                             |
| ----------- | ------------------------------------------------------------------------------------ |
| SPIN-001    | `spinner.types.ts`, `spinner.styles.ts`, `spinner.types.test.ts`, `spinner.test.tsx` |
| SPIN-002    | `spinner.types.ts`, `useSpinner.ts`, `spinner.test.tsx`                              |
| SPIN-003    | `renderSpinner.tsx`, `spinner.test.tsx`                                              |
| SPIN-004    | `spinner.styles.ts`, `useSpinnerStyles.ts`, `spinner.test.tsx`                       |
| SPIN-005    | `useSpinner.ts`, `spinner.test.tsx`                                                  |
| SPIN-006    | `useSpinner.ts`, `useSpinnerStyles.ts`, `spinner.test.tsx`, `spinner.stories.tsx`    |
