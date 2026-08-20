---
"@fluentui-react-native/framework-base": patch
"@fluentui-react-native/components": patch
---

Give each stateful component axis an explicit owner.

Adds `useToggleState` to `framework-base` for controls whose interaction *is* the state change. It wraps
`useControllableValue` and adds a disabled guard and no-op suppression, so the control works both when a caller owns the
value and when it owns the value itself.

Self-driving controls support both directions through the `<state>` / `default<State>` / `on<State>Change` triple:

- `Accordion` gains `defaultExpanded` and no longer treats a supplied `expanded` value as its own uncontrolled default,
  which previously left `expanded={false}` permanently collapsed.
- `Checkbox` and `Switch` route their existing axes through the shared hook so disabled and redundant changes behave
  consistently, and `Switch` now forwards `onPress`.

`Button`, `Card`, `ListItem`, `ListboxItem`, `MenuItem`, `Radio`, and `Tab` keep `selected` as externally driven state.
They render the value they are given and report the interaction through `onPress`, because a press on a button is an
action and a press on a tab, radio, or item is a message to the group that owns the selection.

Storybook stories now demonstrate each axis correctly: `default<State>` drives the self-driving controls, and a
caller-owned `React.useState` story drives selection. `Button` and `Card` no longer expose `selected` as a control,
because that prop decides whether the component is a toggle button or a selectable card at all, and flipping it between
`undefined` and `false` resized or re-roled the component.
