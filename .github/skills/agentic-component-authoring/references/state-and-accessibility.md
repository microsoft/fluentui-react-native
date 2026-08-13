# State and accessibility

Use this reference for `<Component>StateProps`, `use<Component>.ts`, defaults, interaction hooks, accessibility, derived
state, and slot construction. The canonical example is
[`useButton.ts`](../../../../packages/agentic-components/src/components/button/useButton.ts).

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

- Set the native role explicitly.
- Keep disabled state, focusability, and interaction behavior consistent.
- Prefer a consumer-provided `accessible` or `focusable` value only when it does not violate the component contract.
- Add selected or checked semantics only when the corresponding behavior is enabled.
- Use action-oriented accessible names for icon-only controls.

Button warns in development when an icon-only instance lacks an `accessibilityLabel`. Put warnings in an effect so
render remains free of observable side effects, and make the dependency list match every value used by the warning.

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

## Platform behavior

Keep platform-specific native imports out of shared files when React Native forks expose incompatible types. Put fork
imports in platform files or redeclare a small platform-neutral contract. Surface unsupported platform behavior rather
than silently pretending it succeeded.

## Review checklist

- Defaults match the spec and depend on already-derived facts.
- Omitted controlled props retain their meaning.
- User native handlers and unrelated accessibility state are preserved.
- Disabled, focusable, and selected semantics agree.
- Icon-only or unlabeled usage is diagnosed consistently.
- Optional slots exist only when their render condition is active.
- The hook contains no token style selection and no JSX rendering.
