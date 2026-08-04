# Component authoring patterns

`@fluentui-react-native/framework-base` provides component patterns that can remove
unnecessary React wrapper elements while preserving normal JSX usage. New components
should use the modern `directComponent`, `phasedComponent`, and slot APIs described
here. `legacyDirectComponent` and `stagedComponent` exist only for compatibility with
older code.

## Required JSX runtime

Component files using these patterns should put this pragma on the first line:

```tsx
/** @jsxImportSource @fluentui-react-native/framework-base */
```

The custom JSX runtime recognizes direct, phased, and slot components and renders
their underlying elements without adding avoidable wrapper levels. Packages using
the pragma need `@fluentui-react-native/framework-base` in `dependencies`.

Callable slots remain compatible with existing code that invokes a slot to inspect
its element. Native slot refs are supported through the custom JSX runtime. React 18
`React.createElement` does not forward refs through callable function slots, so use
JSX rather than the classic runtime when a slot needs a ref.

## Choosing a pattern

| Need                                              | Pattern                                        |
| ------------------------------------------------- | ---------------------------------------------- |
| Pure prop or element transformation with no hooks | `directComponent`                              |
| Hooks, context, state, tokens, or slot creation   | `phasedComponent`                              |
| Replaceable or optional inner elements            | Slots, normally created in a `phasedComponent` |
| An intentional React component boundary           | A normal React component                       |
| Maintaining existing legacy code                  | `legacyDirectComponent` or `stagedComponent`   |

Slots are a composition mechanism rather than a replacement for the render patterns.
Because `useSlot` and `useOptionalSlot` are hooks, create slots in the first phase of
a `phasedComponent` or in a normal React component. A common component shape is:

1. Use `phasedComponent` for hooks, state, tokens, and slot creation.
2. Return a `directComponent` that emits the final tree without calling hooks.

## `directComponent`

Use `directComponent` for a small, synchronous transformation that does not use
hooks, context, state, or lifecycle behavior. Children are part of the props object. This allows for
pure prop transformations before returning a render tree. It allows a component to be used
directly, but also composed as part of a higher level component without adding unnecessary
layers to the render tree.

```tsx
/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text } from 'react-native';
import type { TextProps } from 'react-native';
import { directComponent } from '@fluentui-react-native/framework-base';

type EmphasizedTextProps = TextProps & {
  emphasis?: 'strong' | 'subtle';
};

export const EmphasizedText = directComponent<EmphasizedTextProps>(({ emphasis = 'strong', style, ...props }) => (
  <Text {...props} style={[{ fontWeight: emphasis === 'strong' ? '700' : '400' }, style]} />
));
```

### Use it when

- The component only filters, defaults, or translates props.
- The component emits a small JSX tree and does not need hooks.
- Removing an otherwise-empty wrapper component is useful.
- It is the render phase returned from `phasedComponent`.

### Do not use it when

- Any hook is needed, including `useSlot`.
- Rendering conditionally changes which hooks would run in a parent phase.
- A distinct React boundary is intentional for lifecycle, profiling, or error handling.

Calling hooks from a direct component violates the Rules of Hooks because the custom
runtime may invoke the function directly.

## `phasedComponent`

Use `phasedComponent` when authoring requires hooks but the final render can still be
flattened. The first phase runs hooks and prepares stable values. It returns a
component for the render phase, which can be of any valid component type. If the final
return is a single component with props a slot created with `useSlot` can be returned.
For a more complex component returning a `directComponent` is recommended.

Do not rely on children during the first phase. Consume children from the props
passed to the returned component.

```tsx
/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text } from 'react-native';
import type { TextProps } from 'react-native';
import { directComponent, mergeProps, phasedComponent, useSlot } from '@fluentui-react-native/framework-base';

type ThemedTextProps = TextProps & {
  tone?: 'default' | 'accent';
};

// with direct component
export const ThemedTextDirect = phasedComponent<ThemedTextProps>((props) => {
  const theme = useTheme();
  const color = props.tone === 'accent' ? theme.colors.brandForeground1 : theme.colors.neutralForeground1;

  // creates a new closure on every render pass
  return directComponent<ThemedTextProps>((renderProps) => {
    const mergedProps = mergeProps(props, renderProps, { style: { color } });
    return <Text {...mergedProps} />;
  });
});

// with useSlot
export const ThemedTextSlot = phasedComponent<ThemedTextProps>((props) => {
  const theme = useTheme();
  const color = props.tone === 'accent' ? theme.colors.brandForeground1 : theme.colors.neutralForeground1;

  // the slot closure will be stored via an internal useRef, props will be updated on every
  // pass, and props passed in via JSX to the returned slot will be merged in automatically
  return useSlot(Text, mergeProps(props, { style: { color } }));
});

// with slot
```

### First phase

- Call hooks, read context, resolve tokens, and create slots.
- Prepare values shared by the final render.
- Do not emit JSX as the phase result.

### Render phase

- Accept final props, including children.
- Do not call hooks.
- Prefer returning a slot via `useSlot` or `directComponent` so the phase does not add a React wrapper.

Use a normal React component instead when the component boundary itself is valuable
or when interoperability requires behavior that depends on a standard React
function-component boundary.

## Slots

A slot is a replaceable inner component with attached base props. Declare slots from
component types:

```tsx
type ButtonSlots = {
  root: Slot<typeof Pressable>;
  content: Slot<typeof Text>;
  accessory: OptionalSlot<typeof View>;
};
```

Use `typeof View`, not `View`, because `Slot` expects the type of the renderable
component value. For a class component, `View` in a type position is the instance
type, while `typeof View` is its constructor/component type.

The slot declarations generate public props and resolved state:

```tsx
type ButtonProps = ComponentProps<ButtonSlots>;
type ButtonState = ComponentState<ButtonSlots>;
```

- Root-slot props are included directly in `ComponentProps`.
- Non-root slots become optional public slot props.
- `OptionalSlot` permits `null` and becomes `undefined` in resolved state.
- Resolved native slots preserve their native ref type.

### Slot hooks

Both hooks accept the component type first, followed by either the previous raw
props form or a slot prop containing props, shorthand children, or an `as` override:

| Hook                                             | Use                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `useSlot(Component, slotProp, options?)`         | A required slot that always resolves to a slot component                              |
| `useOptionalSlot(Component, slotProp, options?)` | An optional slot using v9-compatible `null`, `undefined`, and `renderByDefault` rules |

Options can supply defaults and a final prop transform:

```tsx
const Content = useSlot(Text, content, {
  defaultProps: { selectable: false },
  transform: (props) => ({ ...props, accessibilityRole: 'text' }),
});
```

`useSlot` accepts `undefined` and still creates the base slot. `useOptionalSlot`
uses these absence rules:

- `null` never renders.
- `undefined` does not render unless `renderByDefault` is `true`.
- A provided shorthand or props object renders.
- A missing component type from the previous nullable-component API does not render.

```tsx
const Accessory = useOptionalSlot(View, accessory, {
  defaultProps: accessoryDefaults,
  renderByDefault: false,
});
```

Prefer component inference:

```tsx
const Root = useSlot(View, rootProps);
```

This preserves native ref information. Explicit props-first calls such as
`useSlot<ViewProps>(View, rootProps)` remain supported for compatibility but cannot
derive the native instance type as precisely.

`useSlot` tracks whether required props were resolved. If neither the slot prop nor
`options.defaultProps` provides a required value, that value remains required when
the resolved slot is rendered.

### Slot component example

```tsx
/** @jsxImportSource @fluentui-react-native/framework-base */
import { Pressable, Text, View } from 'react-native';
import { directComponent, phasedComponent, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import type { ComponentProps, ComponentState, OptionalSlot, Slot } from '@fluentui-react-native/framework-base';

type ButtonSlots = {
  root: Slot<typeof Pressable>;
  content: Slot<typeof Text>;
  accessory: OptionalSlot<typeof View>;
};

export type ButtonProps = ComponentProps<ButtonSlots>;
export type ButtonState = ComponentState<ButtonSlots>;

export const Button = phasedComponent<ButtonProps>((props) => {
  const { content, accessory, ...rootProps } = props;

  const Root = useSlot(Pressable, rootProps);
  const Content = useSlot(Text, content);
  const Accessory = useOptionalSlot(View, accessory);

  return directComponent<ButtonProps>(({ content: _content, accessory: _accessory, children, ...finalRootProps }) => (
    <Root {...finalRootProps}>
      {Accessory && <Accessory />}
      <Content>{children}</Content>
    </Root>
  ));
});
```

Slot props support:

```tsx
<Button content="Save" />
<Button content={{ style: { fontWeight: '700' }, children: 'Save' }} />
<Button content={{ as: CustomText, children: 'Save' }} />
```

An `as` replacement must accept the declared slot props. If a slot ref is used, the
replacement must also forward a compatible ref.

### Native refs

Base and JSX refs are composed, remain stable while their inputs are stable, survive
slot prop transforms, and are cleared correctly on unmount.

```tsx
const internalRef = React.useRef<View>(null);
const consumerRef = React.useRef<View>(null);
const Root = useSlot(View, { ref: internalRef });

return <Root ref={consumerRef} />;
```

Both refs receive the same native instance. Keep the custom JSX runtime pragma in
files that render callable slots.

## Legacy patterns

Do not introduce `legacyDirectComponent` or `stagedComponent` in new code.

- `legacyDirectComponent` passes children as trailing arguments.
- `stagedComponent` is the older two-stage form and depends on legacy child handling.

When editing legacy code, migrate to `directComponent` or `phasedComponent` when the
change can be made without altering behavior.
