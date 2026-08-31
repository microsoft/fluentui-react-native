---
name: checkbox
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Checkbox

## Scope

Checkbox is a tri-state selection control built on a React Native `Pressable`.
A single press target covers the indicator and the optional label column. The
status axis carries three values, `unchecked`, `checked`, and `indeterminate`,
and the indicator shape is selected by a two-value `variant` axis.

Checkbox does not group, validate, or submit. It owns no field label, helper
text, or error message, and it does not provide an immediate-effect toggle.
A caller that needs a group relationship, mixed-state roll-up, or validation
messaging composes those from surrounding components and owns the status of
each Checkbox itself.

## Public contract

### Props and defaults

| Prop                | Type                                    | Default         | Contract                                                                                                       |
| ------------------- | --------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| `status`            | `unchecked \| checked \| indeterminate` | absent          | When supplied, the status is externally driven and Checkbox renders the supplied value without changing it.    |
| `defaultStatus`     | `unchecked \| checked \| indeterminate` | `unchecked`     | The starting status while the status is internally driven. Ignored while `status` is supplied.                 |
| `onStatusChange`    | `(nextStatus) => void`                  | absent          | Called with the next status whenever a press resolves one, in both the externally and internally driven cases. |
| `variant`           | `standard \| circular`                  | `standard`      | Selects the indicator corner radius. All other indicator values are shared.                                    |
| `disabled`          | `boolean`                               | `false`         | Blocks activation, removes the root from focus, and selects disabled colors.                                   |
| `label`             | `string`                                | `'Label'`       | The label text and the accessible-name fallback.                                                               |
| `showLabel`         | `boolean`                               | `true`          | Controls whether the label column renders. The name fallback survives hiding it.                               |
| `secondaryText`     | `string`                                | `'Description'` | Supporting text rendered beneath the label.                                                                    |
| `showSecondaryText` | `boolean`                               | `false`         | Renders secondary text; effective only while `showLabel` is `true`.                                            |

The root also accepts the owned `PressableProps` surface. `children` is typed
`never`; Checkbox owns its subtree. A caller `style` is applied after the
token-derived root styles. The broad root type accepts `accessibilityRole` and
caller checked or disabled accessibility state, but the implementation writes
its resolved role and state afterward, so those caller values are ignored.

### Slots and anatomy

`root` is the only public slot surface. The label, secondary text, indicator,
and focus visual are internal and are configured through the props above.

The render order inside the root is the persistent focus visual, the indicator,
and then the label column when either text node is present. The label column
renders the label first and secondary text second.

| Element        | Rendered when                          | Contract                                                                                                                                             |
| -------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focus visual   | always mounted                         | A dual-ring overlay whose visibility, not mounting, tracks focus.                                                                                    |
| Indicator      | always                                 | A fixed 16 by 16 box carrying fill, stroke, and radius. It draws a checkmark for `checked`, a dash for `indeterminate`, and nothing for `unchecked`. |
| Label column   | `showLabel`, or secondary text renders | A non-accessible column that holds the visible text nodes.                                                                                           |
| Label          | `showLabel`                            | Wraps rather than truncates when the root width is constrained.                                                                                      |
| Secondary text | `showLabel` and `showSecondaryText`    | Stays at secondary emphasis for every status.                                                                                                        |

### Requirements

- **CBX-001:** Resolve the documented defaults, keep the supported native root
  props, and reject caller-supplied children at the type level.
- **CBX-002:** Own the status axis as a controllable value. An externally driven
  Checkbox reports the next status and does not change its own; an internally
  driven Checkbox reports and applies it. `checked` resolves to `unchecked`;
  `unchecked` and `indeterminate` both resolve to `checked`.
- **CBX-003:** Render the documented anatomy and order, gate secondary text on a
  visible label, and warn in development builds when secondary text is requested
  without one.
- **CBX-004:** Expose checkbox semantics with a three-valued checked state, a
  name that falls back to `label`, secondary text delivered as supporting
  context, and non-accessible inner text and indicator nodes.
- **CBX-005:** Resolve indicator, label, secondary text, and indicator glyph
  colors from status first and then disabled, pressed, and hovered state, select
  the indicator radius from `variant`, and apply the caller `style` last.
- **CBX-006:** Keep the dual-ring focus visual mounted and show it only for a
  focused, enabled Checkbox.

## Platform behavior

Windows and macOS resolve press, hover, and focus from React Native `Pressable`
events. Space activation comes from the native pressable button behavior on both
platforms; Checkbox adds no key handling of its own and does not intercept Tab.
A disabled Checkbox sets `focusable` to `false` and is skipped by keyboard
navigation.

Checkbox suppresses the react-native-windows native focus visual so the shared
dual-ring visual is the single indicator. Pointer focus hides that visual;
keyboard and programmatic focus show it. The shared visual stays mounted for the
lifetime of the control and only changes visibility, which avoids creating
border-bearing native views after mount.

No timed animation is present. Status, hover, press, and focus styling change on
the next render, so reduced-motion settings need no separate branch.

## Divergences from Flex

| ID                                       | Disposition | React Native contract                                                                                                                                                                                                            | Follow-up                                                                                         |
| ---------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `checkbox-secondary-text-description`    | Accepted    | Secondary text is appended to the root accessibility hint rather than associated as a separate described-by target. React Native exposes no equivalent description relationship, and the hint is the platform-idiomatic channel. | None. Revisit only if React Native adds a description association.                                |
| `checkbox-secondary-text-requires-label` | Accepted    | Secondary text renders only alongside a visible label, and a development warning fires otherwise. Flex treats the two visibility toggles as independent.                                                                         | None. The pairing keeps the label column from presenting supporting text with nothing to support. |
| `checkbox-focus-visual-modality`         | Resolved    | The shared focus-modality hook suppresses the visual for pointer focus and shows it for keyboard or programmatic focus.                                                                                                          | Implemented in `useCheckbox.ts` and covered by interaction tests.                                 |
| `checkbox-native-focus-ring`             | Resolved    | The native Windows focus ring is disabled so it cannot compete with the shared dual-ring visual.                                                                                                                                 | Implemented in `useCheckbox.ts` and covered by root-prop tests.                                   |
| `checkbox-owned-props-type-surface`      | Deferred    | The root type accepts role and checked or disabled state values that the implementation always overwrites.                                                                                                                       | Omit those owned keys from the exposed native-prop type in a separately reviewed API correction.  |

## Conformance

| Requirement | Evidence                                                                             |
| ----------- | ------------------------------------------------------------------------------------ |
| CBX-001     | `checkbox.types.ts`, `useCheckbox.ts`, `checkbox.types.test.ts`, `checkbox.test.tsx` |
| CBX-002     | `useCheckbox.ts`, `checkbox.test.tsx`, `checkbox.stories.tsx`                        |
| CBX-003     | `renderCheckbox.tsx`, `useCheckbox.ts`, `checkbox.test.tsx`                          |
| CBX-004     | `useCheckbox.ts`, `checkbox.test.tsx`                                                |
| CBX-005     | `checkbox.styles.ts`, `useCheckboxStyles.ts`, `checkbox.test.tsx`                    |
| CBX-006     | `useCheckboxStyles.ts`, `renderCheckbox.tsx`, `checkbox.test.tsx`                    |
