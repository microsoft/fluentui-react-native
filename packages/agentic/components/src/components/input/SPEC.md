---
name: input
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Input

## Scope

Input is a single-line text entry control built around a React Native
`TextInput` inside a bordered container. It supports two border treatments,
three sizes, an optional leading icon, and up to two trailing icons.

Input owns no field label, helper text, error message, character counter, or
validation logic. It accepts an error flag and renders the matching boundary,
but the message and the decision to set the flag belong to the surrounding
form. It is not a search box, a combobox, a picker, or a multi-line editor.

## Public contract

### Props and defaults

| Prop                                                                      | Type                       | Default   | Contract                                                                                 |
| ------------------------------------------------------------------------- | -------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `variant`                                                                 | `outline \| underline`     | `outline` | Selects a full border or a bottom edge, and whether the root carries a corner radius.    |
| `size`                                                                    | `small \| medium \| large` | `medium`  | Selects typography, padding, gaps, icon size, minimum height, and outline radius.        |
| `disabled`                                                                | `boolean`                  | `false`   | Blocks editing, clears tracked interaction state, and selects disabled colors.           |
| `readOnly`                                                                | `boolean`                  | `false`   | Blocks editing while keeping the value announced and the foreground at primary emphasis. |
| `error`                                                                   | `boolean`                  | `false`   | Selects the danger boundary and marks the field invalid.                                 |
| `value`                                                                   | `string`                   | absent    | When supplied, the value is externally driven.                                           |
| `defaultValue`                                                            | `string`                   | `''`      | The starting value while the value is internally driven.                                 |
| `placeholder`                                                             | `string`                   | absent    | Placeholder text shown while the value is empty.                                         |
| `onChangeText`                                                            | `(text: string) => void`   | absent    | Called with the next text on every accepted edit.                                        |
| `onFocus`, `onBlur`, `onHoverIn`, `onHoverOut`, `onPressIn`, `onPressOut` | handlers                   | absent    | Forwarded to the text input alongside the component's own state tracking.                |

The root accepts the owned `ViewProps` surface. `accessibilityLabel`,
`accessibilityHint`, `accessibilityState`, `accessible`, `focusable`, and
`testID` are lifted from the root and applied to the text input, because the
text input is the accessible element. A caller `style` is applied to the root
after the token-derived root styles.

### Slots and anatomy

`textInput`, `iconStart`, `iconEnd1`, and `iconEnd2` are public slots and
accept a props object or an `as` replacement component.

The render order is the root, then the contents row, then the icon-and-text
stack containing the leading icon and the text input, then the trailing icon
group, then the underline when the underline variant is active.

| Slot                   | Rendered when                        | Contract                                                                                                                                  |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `root`                 | always                               | A non-accessible `View` that owns the corner radius, overflow clipping, and the caller style.                                             |
| Contents               | always                               | A non-accessible row that owns the background, the stroke, the minimum height, and the gap between the text stack and the trailing icons. |
| Icon-and-text stack    | always                               | A non-accessible row that owns horizontal padding and lets the text input grow and shrink.                                                |
| `iconStart`            | supplied                             | A leading icon sized and colored by the component and hidden from the accessibility tree.                                                 |
| `textInput`            | always                               | The accessible element. It carries role, name, state, editability, and the resolved text style.                                           |
| Trailing icon group    | `iconEnd1` or `iconEnd2` is supplied | A non-accessible row that owns the trailing gap and end padding.                                                                          |
| `iconEnd1`, `iconEnd2` | supplied                             | Trailing icons. `iconEnd2` renders only alongside `iconEnd1`.                                                                             |
| Underline              | `variant="underline"`                | An absolutely positioned bottom-edge view inside the contents row.                                                                        |

### Requirements

- **INP-001:** Resolve the documented defaults and keep the supported native
  root props, moving the accessibility and identification props to the text
  input.
- **INP-002:** Own the value as a controllable string, forward text changes to
  `onChangeText`, and refuse to update the internally driven value while
  disabled or read only.
- **INP-003:** Resolve one visual state per render with the precedence
  disabled, error, read only, focused, pressed, hovered, rest, and clear the
  tracked interaction state when the control becomes disabled.
- **INP-004:** Render the documented order, render `iconEnd2` only alongside
  `iconEnd1` and warn in development builds otherwise, and render the underline
  view only for the underline variant.
- **INP-005:** Expose textbox semantics on the text input with disabled,
  read-only, and invalid state, keep every wrapper view non-accessible, and
  keep read-only fields editable-in-name-only rather than disabled.
- **INP-006:** Resolve size metrics, stroke colors, icon size and color, and
  placeholder color from theme tokens, and apply the caller `style` last.

## Platform behavior

Windows and macOS use the platform text input for caret placement, selection,
text composition, clipboard behavior, and character entry. Input adds no key
handling of its own and does not intercept Tab, so the platform tab order and
the platform text-editing shortcuts apply unchanged.

Hover and press state are tracked from events on the text input rather than the
surrounding container, so pointer feedback follows the text area. Disabling the
control clears focus, hover, and press so a disabled field never keeps stale
interaction styling.

Input renders no dedicated focus ring on either platform. Focus is shown by
recoloring the boundary to the heavy neutral stroke at the same thickness as
the rest state. `focusable` defaults to `true` unless disabled.

There is no timed animation, so visual state changes are immediate and
reduced-motion settings need no separate path.

## Divergences from Flex

| ID                              | Disposition | React Native contract                                                                                                                                                                                      | Follow-up                                                                                                                                         |
| ------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input-focus-indicator`         | Deferred    | Focus recolors the existing boundary to the heavy neutral stroke at the rest thickness. There is no dual-ring focus visual for the outline variant and no thickened bottom edge for the underline variant. | Adopt the shared focus visual for the outline variant and a thicker focused edge for the underline variant, then update the conformance evidence. |
| `input-hover-target-scope`      | Deferred    | Hover and press are tracked from the text input, so pointer feedback does not cover the container padding or the icon areas. Flex treats the whole field as the hover surface.                             | Move interaction tracking to the contents row, which requires reworking how the state is derived.                                                 |
| `input-underline-double-stroke` | Resolved    | The dedicated absolutely positioned underline view is the sole owner of the underline variant's bottom edge, so exactly one thin stroke is drawn.                                                          | Implemented in `input.styles.ts` and covered by variant style tests.                                                                              |
| `input-icon-count`              | Accepted    | The trailing icon surface is exactly two ordered slots, with the second gated on the first, rather than an open-ended icon area.                                                                           | None. The fixed arity keeps the trailing group measurable at layout time.                                                                         |

## Conformance

| Requirement | Evidence                                                                  |
| ----------- | ------------------------------------------------------------------------- |
| INP-001     | `input.types.ts`, `useInput.ts`, `input.types.test.tsx`, `input.test.tsx` |
| INP-002     | `useInput.ts`, `input.test.tsx`                                           |
| INP-003     | `useInput.ts`, `input.styles.ts`, `input.test.tsx`                        |
| INP-004     | `renderInput.tsx`, `useInput.ts`, `input.test.tsx`, `input.stories.tsx`   |
| INP-005     | `useInput.ts`, `useInputStyles.ts`, `input.test.tsx`                      |
| INP-006     | `input.styles.ts`, `useInputStyles.ts`, `input.test.tsx`                  |
