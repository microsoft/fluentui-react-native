---
"@fluentui-react-native/framework-base": patch
"@fluentui-react-native/components": patch
---

Support externally driven and internally driven toggleable state across agentic components.

Adds `useToggleState` to `framework-base`, a controlled/uncontrolled boolean hook built on `useControllableValue` with
`toggle` and `select` activation modes, a disabled guard, and detection of whether a caller opted into the state axis.

Every agentic component with a toggleable axis now accepts the full `<state>` / `default<State>` / `on<State>Change`
prop triple and changes its own state on press when no controlled value is supplied:

- `Button`, `Card`, `ListItem`, `ListboxItem`, `MenuItem`, `Radio`, and `Tab` gain `defaultSelected` and
  `onSelectedChange`. Multi-select surfaces toggle, while `Radio`, `Tab`, and single-select items only ever select.
- `Accordion` gains `defaultExpanded` and no longer treats a supplied `expanded` value as its uncontrolled default.
- `Checkbox` and `Switch` route their existing axes through the shared hook so disabled and no-op changes behave
  consistently.

Storybook stories now start from the `default<State>` props so components respond to presses, and each toggleable
component adds a story that owns the value externally through its change event.
