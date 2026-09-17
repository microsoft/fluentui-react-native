# State and accessibility

Use this reference for `<Component>StateProps`, `use<Component>.ts`, defaults, interaction hooks, accessibility, derived
state, and slot construction. The canonical example is
[`useButton.ts`](../../../../packages/agentic/components/src/components/button/useButton.ts).

## State hook responsibilities

The state hook owns:

1. Destructuring component-owned props while preserving unhandled native props.
2. Applying behavioral defaults.
3. Deriving facts needed by accessibility, styles, and rendering.
4. Validating development-time usage.
5. Reading theme state.
6. Configuring the native interaction hook.
7. Constructing required and optional slots.
8. Returning one complete resolved state object.

Do not resolve token styles or render elements in this hook.

## Preserve raw presence before applying defaults

Derive presence-sensitive behavior from raw props. Button computes `hasContent`, `hasIcon`, and `hasSelectedIcon` before
constructing slots. It uses those values to derive `iconOnly`, while `selected !== undefined` determines whether toggle
semantics are enabled even when `selected` is false.

Apply context-sensitive defaults only after those facts are known. Button defaults shape to `circle` for icon-only use
and `rounded` otherwise.

## Decide who owns a stateful axis

Before wiring any state, decide which of two kinds of axis you are building. Getting this wrong produces a component
that either cannot be used interactively or changes state when it should not.

### Self-driving controls

The interaction _is_ the state change. Pressing a checkbox checks it; pressing a switch flips it; pressing a disclosure
header expands it. There is no other reasonable interpretation of the press, and the control needs no outside
coordination to be correct on its own.

These support both directions with one prop triple per axis:

| Prop              | Purpose                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| `<state>`         | The externally driven value. Supplying it makes the axis controlled.      |
| `default<State>`  | The initial internally driven value. Ignored while `<state>` is supplied. |
| `on<State>Change` | The state change event, called with the next value in both directions.    |

Name the triple after the axis: `checked` / `defaultChecked` / `onChange` for Switch, `status` / `defaultStatus` /
`onStatusChange` for Checkbox, `expanded` / `defaultExpanded` / `onExpandedChange` for Accordion.

Resolve a boolean axis with `useToggleState` from `@fluentui-react-native/framework-base`, which wraps
`useControllableValue` and adds the disabled guard and no-op suppression:

```ts
const expansion = useToggleState({ value: expanded, defaultValue: defaultExpanded, onChange: onExpandedChange });
```

Then drive it from the interaction handler and forward the user's own handler. Multi-value axes such as Checkbox's
tri-state `status` use `useControllableValue` directly.

### Externally driven selection

The press is an _activation_, and what it means for selection is decided by a caller or a surrounding group. A button
press runs an action; a tab, radio, list item, listbox item, or menu item press tells its group which entry was chosen,
and the group decides what to select and what to clear.

These components must **not** change their own selection:

- Expose only `selected?: boolean`, and render exactly what is given.
- Do not add `defaultSelected` or `onSelectedChange`. There is no internally driven mode to seed or report.
- Forward `onPress` unchanged; it is the interaction event the owner reacts to.
- Derive selection semantics from the resolved value, and gate optional semantics on `selected !== undefined` when the
  axis is opt-in.

A normal button must not change state on a press. A lone radio or tab that selected itself would also be wrong, because
it could never deselect and nothing would clear its siblings.

### Watch axes that change component identity

When `selected !== undefined` switches a component between two shapes, that is an identity change rather than a value
change. Button uses it to become a toggle button, which adds the Semibold ghost label that reserves layout width, and
Card uses it to become selectable, which adds the interactive overlay.

Keep those axes stable for a given instance and do not expose them as a Storybook control, because flipping the control
between `undefined` and `false` visibly resizes or re-roles the component. Demonstrate the axis with focused stories
that always supply a value.

## Merge accessibility deliberately

Start with consumer-provided accessibility state, then apply component-owned semantics:

```ts
accessibilityState: {
  ...accessibilityState,
  disabled,
  ...(isToggle && { checked: selected }),
}
```

The component must own its role and state semantics while preserving unrelated consumer values such as `busy`.

- Set native semantics with React Native's ARIA-aligned `role` prop, not the legacy `accessibilityRole`. Use ARIA names
  such as `img` and `heading`, not legacy names such as `image` and `header`.
- Omit both `role` and `accessibilityRole` from public native props when the component owns the role. If a caller owns
  the semantic choice, expose only `role`.
- Keep disabled state, focusability, and interaction behavior consistent.
- Prefer a consumer-provided `accessible` or `focusable` value only when it does not violate the component contract.
  Disabled state is authoritative: resolve focusability with the shared component interaction helper so
  `focusable={true}` cannot keep a disabled control in the focus order.
- Add selected or checked semantics only when the corresponding behavior is enabled.
- Use action-oriented accessible names for icon-only controls.

Button warns in development when an icon-only instance lacks an `accessibilityLabel`. Use `useDevWarning` from
`@fluentui-react-native/framework-base` for conditional usage warnings so render remains free of observable side
effects and repeated renders do not emit duplicate messages.

## Use framework interaction and slot hooks

Interactive roots should use the framework state hook, such as `usePressableState`, so hovered, pressed, and focused
state is normalized and user handlers are forwarded.

Construct slots after native props are resolved:

- `useSlot` for the required root.
- `useOptionalSlot` for optional public slots.
- `useOptionalSlot` for private state-only slots when their condition is active.

Pass `null` for a slot that must not exist. Do not create a placeholder slot and hide it later with styles.

Button constructs its hidden Semibold content and content container only when toggle behavior and visible content require
them. This keeps ordinary buttons free of the extra structure.

## Return stable resolved state

Return:

- slot functions
- required variant values
- derived state
- preserved user styles
- theme state
- interaction state

Keep property ordering intentional so later spreads cannot silently replace component-owned values. If two state sources
can share a key, assign the final owned value explicitly after spreading.

Export the hook from the package root as `use<Component>_unstable`, together with its resolved `<Component>State` type,
so another component can extend the state stage without importing package internals.

## Platform behavior

Keep platform-specific native imports out of shared files when React Native forks expose incompatible types. Put fork
imports in platform files or redeclare a small platform-neutral contract. Surface unsupported platform behavior rather
than silently pretending it succeeded.

## Review checklist

- Defaults match the spec and depend on already-derived facts.
- Omitted controlled props retain their meaning.
- Each stateful axis is classified before it is wired: a self-driving control exposes `<state>`, `default<State>`, and
  `on<State>Change` and changes state on interaction, while externally driven selection exposes only `selected` and
  never changes it.
- A press on a button, tab, radio, or item does not change that component's own selection.
- An axis that changes component identity stays stable per instance and is not a Storybook control.
- User native handlers and unrelated accessibility state are preserved.
- Disabled, focusable, and selected semantics agree.
- Icon-only or unlabeled usage is diagnosed consistently.
- Optional slots exist only when their render condition is active.
- The hook contains no token style selection and no JSX rendering.
