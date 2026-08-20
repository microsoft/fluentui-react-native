# @fluentui-react-native/components

## 0.2.2

### Patch Changes

- 853f1fd: Moved the location of callout, with links to new location
- 5bc9e81: Normalize component controlled and uncontrolled state patterns and utilities
- 54870b4: Remove file added inadvertently after the move of the storybook app
- 5bc9e81: Give each stateful component axis an explicit owner.

  Adds `useToggleState` to `framework-base` for controls whose interaction _is_ the state change. It wraps
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

- cbd319c: Bump package to publish via ESRP (no changes)
- Updated dependencies [853f1fd]
- Updated dependencies [5bc9e81]
- Updated dependencies [5bc9e81]
- Updated dependencies [5bc9e81]
- Updated dependencies [cbd319c]
  - @fluentui-react-native/callout@0.29.2
  - @fluentui-react-native/framework-base@0.6.1
  - @fluentui-react-native/design@0.3.1

## 0.2.1

### Patch Changes

- 3405262: Very initial framework for RNW fabric callout implementation
- Updated dependencies [2cb34bb]
- Updated dependencies [3405262]
  - @fluentui-react-native/callout@0.29.1

## 0.2.0

### Minor Changes

- 778d82b: Export the generated agentic components and their composition helpers, and fix their build errors.
- 778d82b: Add shared component primitives, styling utilities, state hooks, accessibility diagnostics, and owned native-root prop types.

### Patch Changes

- c41071d: Bug fixes and additional stories for primitives
- 1157793: Export shared state-based styling utilities from the design package styling submodule
- 778d82b: Consolidation of shared utilities, dependency profile updates, and more generated components
- ea738f0: Align agentic Button corner radii with desktop V1 values and add context-backed FURN Theme-to-Flex token conversion
- Updated dependencies [3abc13a]
- Updated dependencies [778d82b]
- Updated dependencies [3abc13a]
- Updated dependencies [1157793]
- Updated dependencies [778d82b]
- Updated dependencies [ea738f0]
  - @fluentui-react-native/design@0.3.0
  - @fluentui-react-native/framework-base@0.6.0
