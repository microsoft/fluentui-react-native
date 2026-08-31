---
name: radio
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Radio

## Scope

Radio is a pressable, visually radio-shaped option with a label and optional
supporting text. It represents the value supplied by its caller. It does not
provide a RadioGroup, coordinate mutual exclusion, or update selected state on
its own.

## Public contract

`label` defaults to `"Label"`, `secondaryText` to `"Description"`, and
`disabled`, `selected`, and `showSecondaryText` to `false`. The only public
slot is `root`; children are not accepted. The caller can provide owned React
Native Pressable props and a `style`, which is applied after component root
styles.

The root renders its persistent FocusVisual, the 16-unit indicator, its
10-unit dot, and a label container. The label container contains the label and
the secondary text only when `showSecondaryText` is true. A selected dot is
opaque and uses the brand foreground. An unselected dot remains in the tree
with zero opacity.

`selected` is externally owned. Pressing reports through `onPress` without
modifying it. The root always has the `radio` role, merges caller accessibility
state with `checked` and `disabled`, and uses the label as its default
accessible name. Visible secondary text becomes the default accessibility
hint. The implementation relies on the accessible root to group its descendants
rather than explicitly hiding the indicator and text children.

### Requirements

- **RAD-001:** Resolve defaults, root-only slot ownership, and React Native
  root-prop forwarding as documented.
- **RAD-002:** Render the indicator, dot, label, and optional supporting text
  in the fixed order.
- **RAD-003:** Render externally owned checked state without self-selection
  and preserve press reporting.
- **RAD-004:** Apply selection, disabled, hovered, pressed, and user-style
  precedence to the documented token bindings.
- **RAD-005:** Expose radio semantics, accessible naming, disabled behavior,
  descendant grouping, and the persistent FocusVisual.

## Platform behavior

On Windows and macOS the root is an accessible React Native `Pressable` with
the `radio` role. UIA and AX receive its name, checked value, and disabled
value from the root. Disabled radios cannot be focused or activated. The
indicator and text subtrees are explicitly hidden from assistive technology so
the named root is the single announced element.

Native Pressable events provide hover, press, focus, and keyboard activation.
The FocusVisual remains in the tree and is visible only for an enabled focused
radio. Group name, arrow-key navigation, single-tab-stop behavior, peer
selection, and focus restoration must be implemented by the component that
renders the radios.

## Divergences from Flex

- `radio-native-composition` (**accepted**): FURN renders the label and
  indicator directly with React Native Text and View primitives instead of
  composing a platform label control.
- `radio-group-coordination` (**accepted**): FURN Radio exposes only
  externally driven `selected` state; mutual exclusion and group navigation
  are not included in this component.
- `radio-descendant-accessibility` (**resolved**): The indicator, dot, and text
  descendants are explicitly hidden from assistive technology, leaving the
  named radio root as the single announced element.

## Conformance

| Requirement | Evidence                                                 |
| ----------- | -------------------------------------------------------- |
| RAD-001     | `radio.types.ts`, `useRadio.ts`, `radio.types.test.ts`   |
| RAD-002     | `renderRadio.tsx`, `useRadioStyles.ts`, `radio.test.tsx` |
| RAD-003     | `useRadio.ts`, `radio.test.tsx`, `radio.stories.tsx`     |
| RAD-004     | `radio.styles.ts`, `useRadioStyles.ts`, `radio.test.tsx` |
| RAD-005     | `useRadio.ts`, `useRadioStyles.ts`, `radio.test.tsx`     |
