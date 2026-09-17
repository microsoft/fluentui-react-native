---
name: destructive-button
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# DestructiveButton

## Scope

DestructiveButton presents a single irreversible or high-consequence action
through a React Native `Pressable` on Windows and macOS. It carries the danger
color family so the control itself signals loss, deletion, or another outcome
that is hard to reverse.

DestructiveButton is a distinct component rather than a widened Button
appearance. The catalog entry trims the emphasis axis to two values, removes
the selection axis entirely, and rebinds rest, hovered, and pressed color to
the danger family. Modelling that as a Button appearance would leave Button
carrying a selection axis and two shape values that the destructive contract
must not expose.

DestructiveButton is not a toggle, a link, a menu trigger, or a confirmation
surface. It does not gate its own activation; a caller that needs confirmation
owns that dialog.

## Public contract

### Props and defaults

| Prop           | Type                       | Default                                         | Contract                                                    |
| -------------- | -------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| `appearance`   | `primary \| subtle`        | `primary`                                       | Selects the danger emphasis level.                          |
| `size`         | `small \| medium \| large` | `medium`                                        | Selects typography, icon size, spacing, and rounded radius. |
| `shape`        | `rounded \| circle`        | `rounded` with content; `circle` when icon-only | Controls the root corner radius.                            |
| `disabled`     | `boolean`                  | `false`                                         | Disables activation and removes the root from focus.        |
| `iconPosition` | `before \| after`          | `before`                                        | Places the icon relative to content.                        |

The source declares defaults for shape and size but not for the emphasis axis.
This contract resolves `appearance` to `primary` because the axis is ordered by
descending emphasis, `primary` is its highest value, and the canonical use is
the confirm action of a delete or discard flow. Button's `secondary` default has
no counterpart in a two-value danger axis.

The root also exposes owned `PressableProps`, except children and styles that
the component resolves itself. A user `style` is applied after token-derived
root styles.

### Slots and anatomy

The render order is the persistent focus visual, the icon when positioned
before, content, and the icon when positioned after.

| Slot      | Required | Contract                                                        |
| --------- | -------- | --------------------------------------------------------------- |
| `root`    | yes      | A `Pressable` that owns action semantics and interaction state. |
| `content` | no       | A `Text` slot. It may wrap when the root width is constrained.  |
| `icon`    | no       | An `Icon` slot. It is hidden from the accessibility tree.       |

Both slots are optional in the type system so a caller can build either
documented layout. An icon-only button has an icon and no content; it keeps a
minimum 24 by 24 layout and requires an action-oriented `accessibilityLabel`.

The component does not supply a default label. The source default of "Delete"
is design-tool authoring state, not a runtime guarantee, and inventing a
destructive verb for a caller who omitted `content` would be unsafe.

### Requirements

- **DBTN-001:** Resolve the documented defaults, including the contextual
  icon-only shape, and preserve supported native root props.
- **DBTN-002:** Render only supplied optional slots in the documented order and
  allow content to wrap under a constrained root.
- **DBTN-003:** Resolve appearance, disabled, pressed, and hovered visuals from
  the Flex danger token family, keep both appearances strokeless, and apply the
  user root style last.
- **DBTN-004:** Expose button semantics, merge caller accessibility state, warn
  for an unnamed icon-only button, and hide the decorative icon.
- **DBTN-005:** Expose no selection axis. The public props admit neither
  `selected` nor `selectedIcon`, and the root never reports checked state.
- **DBTN-006:** Keep the dual-ring `FocusVisual` mounted and show it only for a
  focused, enabled button while disabling the native Windows focus ring.

## Platform behavior

Windows and macOS use React Native press, hover, and focus events. `Enter` and
`Space` activation are supplied by the native `Pressable` button behavior.
Disabled buttons are not focusable.

React Native Windows native focus visuals are disabled because dynamically
mounting its border visual can crash supported RNW versions. The component
keeps the shared dual-ring `FocusVisual` mounted and changes only its
visibility state. The contract adds no motion; visual state changes are
immediate, so reduced-motion handling needs no separate branch.

## Reuse boundary

DestructiveButton owns a full component-qualified pipeline: its own state,
style, and render stages exported under `useDestructiveButton_unstable`,
`useDestructiveButtonStyles_unstable`, and `renderDestructiveButton_unstable`.
It shares Button's primitives (`Text`, `Icon`, `FocusVisual`) and reuses
`getButtonIconSize` because the source states that icon sizing inherits from
Button, so the two components must not drift apart.

Structural spacing and radius values are restated locally rather than reused
from Button's factory. Button's factory is keyed by a shape axis that includes
`square`, and reusing it would require DestructiveButton to satisfy a state
shape carrying Button's selection axis. Button is left unchanged.

## Divergences from Flex

| ID                                    | Disposition              | React Native contract                                                                                                                                                | Follow-up                                                              |
| ------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `destructive-button-single-icon-slot` | Deferred alignment       | FURN has one `icon` plus `iconPosition`. The source has independent leading and trailing icon slots that can both be visible.                                        | Align with Button through one separately reviewed public API change.   |
| `destructive-button-icon-only-shape`  | Accepted local extension | An unspecified `shape` resolves to `circle` for an icon-only button instead of the source default of rounded, matching Button and the source's conventional pairing. | Preserve while the button family shares one shape-resolution behavior. |
| `destructive-button-mobile-secondary` | Not applicable           | The mobile surface adds a third `Secondary` style, drops the shape axis, and uses a different icon-size ramp. This contract targets Windows and macOS.               | Revisit only if this package targets iOS or Android.                   |

## Conformance

| Requirement | Evidence                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------- |
| DBTN-001    | `destructive-button.types.ts`, `useDestructiveButton.ts`, `destructive-button.test.tsx`           |
| DBTN-002    | `renderDestructiveButton.tsx`, `destructive-button.test.tsx`, `destructive-button.stories.tsx`    |
| DBTN-003    | `destructive-button.styles.ts`, `useDestructiveButtonStyles.ts`, `destructive-button.test.tsx`    |
| DBTN-004    | `useDestructiveButton.ts`, `useDestructiveButtonStyles.ts`, `destructive-button.test.tsx`         |
| DBTN-005    | `destructive-button.types.ts`, `destructive-button.types.test.tsx`, `destructive-button.test.tsx` |
| DBTN-006    | `useDestructiveButtonStyles.ts`, `renderDestructiveButton.tsx`, `destructive-button.test.tsx`     |
