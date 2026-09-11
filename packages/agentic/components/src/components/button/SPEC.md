---
name: button
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Button

## Scope

Button presents a single action through a React Native `Pressable`. It supports
text, an icon, or both on Windows and macOS. This contract describes the
existing public API; issue #4252 does not change Button behavior to match newer
Flex APIs.

Button is not a link, menu trigger, split button, or state container. Supplying
`selected` opts into toggle-button presentation, but the caller owns and
updates that value.

## Public contract

### Props and defaults

| Prop           | Type                                        | Default                                         | Contract                                                    |
| -------------- | ------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| `appearance`   | `primary \| secondary \| outline \| subtle` | `secondary`                                     | Selects the visual emphasis.                                |
| `size`         | `small \| medium \| large`                  | `medium`                                        | Selects typography, icon size, spacing, and rounded radius. |
| `shape`        | `rounded \| square \| circle`               | `rounded` with content; `circle` when icon-only | Controls the root corner radius.                            |
| `disabled`     | `boolean`                                   | `false`                                         | Disables activation and removes the root from focus.        |
| `iconPosition` | `before \| after`                           | `before`                                        | Places the active icon relative to content.                 |
| `selected`     | `boolean`                                   | absent                                          | When present, exposes externally controlled toggle state.   |

The root also exposes owned `PressableProps`, except children and styles that
the component resolves itself. A user `style` is applied after token-derived
root styles.

### Slots and anatomy

The render order is the persistent focus visual, the icon when positioned
before, content, and the icon when positioned after.

| Slot           | Required | Contract                                                          |
| -------------- | -------- | ----------------------------------------------------------------- |
| `root`         | yes      | A `Pressable` that owns action semantics and interaction state.   |
| `content`      | no       | A `Text` slot. It may wrap when the root width is constrained.    |
| `icon`         | no       | The normal `Icon` slot. It is hidden from the accessibility tree. |
| `selectedIcon` | no       | Replaces `icon` while selected; falls back to `icon` when absent. |

An icon-only button has an icon and no content. It keeps a minimum 24 by 24
layout and requires an action-oriented `accessibilityLabel`.

### Requirements

- **BTN-001:** Resolve documented defaults and preserve supported native root
  props.
- **BTN-002:** Render only supplied optional slots in the documented order,
  with the selected-icon fallback and wrapping content behavior.
- **BTN-003:** Resolve appearance, selection, disabled, pressed, and hovered
  visual state from Flex tokens; user root style wins last.
- **BTN-004:** Expose button semantics, merge caller accessibility state, warn
  for an unnamed icon-only button, and hide decorative icons.
- **BTN-005:** Treat `selected` as externally owned state, expose checked
  accessibility state when that prop is present, and reserve semibold label
  width to prevent toggle reflow.
- **BTN-006:** Follow the [shared focus visual policy](../AGENTS.md#focus-visual-policy)
  on the root: request native focus visuals on every platform, with the mounted dual-ring
  `FocusVisual` retained for the custom path.

## Platform behavior

Windows and macOS use React Native press, hover, and focus events. `Enter` and
`Space` activation are supplied by the native `Pressable` button behavior.
Disabled buttons are not focusable.

The root requests native focus visuals on every platform under the shared policy.
The dual-ring `FocusVisual` stays mounted but hidden on that path; its existing
visibility behavior remains in the evaluation fallback on every platform.
Native rendering depends on platform support. The contract adds no
component-owned motion or native modality guarantee.

## Divergences from Flex

`native-system-focus-visuals` is an **accepted** [shared native adaptation](../AGENTS.md#focus-visual-policy).

| ID                        | Disposition              | React Native contract                                                                                                                                 | Follow-up                                                           |
| ------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `button-selection-axis`   | Deferred alignment       | FURN retains `selected` on Button and exposes checked state. Current Flex models toggle behavior as a separate ToggleButton.                          | A separate API proposal, migration, and changeset are required.     |
| `button-single-icon-slot` | Deferred alignment       | FURN has one `icon` plus `iconPosition`, with `selectedIcon` for selected presentation. Current Flex has independent leading and trailing icon slots. | Align only through a separately reviewed public API change.         |
| `button-square-shape`     | Accepted local extension | FURN supports `square` in addition to rounded and circular forms.                                                                                     | Preserve for compatibility unless a future API proposal removes it. |

## Conformance

| Requirement | Evidence                                                                    |
| ----------- | --------------------------------------------------------------------------- |
| BTN-001     | `button.types.ts`, `useButton.ts`, `button.test.tsx`                        |
| BTN-002     | `renderButton.tsx`, `button.test.tsx`, `button.stories.tsx`                 |
| BTN-003     | `button.styles.ts`, `useButtonStyles.ts`, `button.test.tsx`                 |
| BTN-004     | `useButton.ts`, `useButtonStyles.ts`, `button.test.tsx`                     |
| BTN-005     | `useButton.ts`, `renderButton.tsx`, `button.test.tsx`                       |
| BTN-006     | `useButton.ts`, `useButtonStyles.ts`, `renderButton.tsx`, `button.test.tsx` |
