# `@fluentui-react-native/framework-base`

Core implementations and types shared by the Fluent UI React Native frameworks: component patterns, slots, the custom
JSX runtime, interaction and accessibility helpers, and utilities for immutable merging, memoization, and prop merging.
Earlier standalone packages, including the merge and memoization utilities, are now part of this package.

## Quick start

Add the package as a dependency, then put the JSX runtime pragma on the **first line** of each component file that
uses the component patterns:

```tsx
/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text } from 'react-native';
import type { TextProps } from 'react-native';
import { directComponent } from '@fluentui-react-native/framework-base';

export const StrongText = directComponent<TextProps>(({ style, ...props }) => <Text {...props} style={[{ fontWeight: '700' }, style]} />);
```

The runtime at `@fluentui-react-native/framework-base/jsx-runtime` flattens direct and phased components and supports
slot refs. Compiled output imports it, so packages using the pragma declare this package in `dependencies`. The
pragma replaces the legacy `/** @jsx withSlots */` directive; the exported `withSlots` helper remains only for the
classic runtime used by deprecated framework code.

## Documentation

| Topic                                                  | Covers                                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| [Component patterns](references/component-patterns.md) | Choosing and combining `directComponent`, `phasedComponent`, and slots |
| [Accessibility](references/accessibility.md)           | `resolveAccessibilityAction` and the shared semantic action contract   |
| [Immutable merge](references/immutable-merge.md)       | `immutableMerge`, `immutableMergeCore`, and custom merge options       |
| [Memo cache](references/memo-cache.md)                 | `getMemoCache`, `getTypedMemoCache`, and `memoize`                     |
| [Merge props](references/merge-props.md)               | `mergeProps`, `mergeStyles`, and style identity                        |
| [Contributing](references/contributing.md)             | Source ownership, compatibility, tests, and validation                 |

The [reference index](references/README.md) lists every reference by ID. Agents working in this package start from
[AGENTS.md](AGENTS.md).

## Type helpers

- `PropsOf<TComponent>` - Extract props from a React component type
- `PropsWithRefOf<TComponent>` - Extract props, including a supported ref, from a React component type
- `PropsChildren<TProps>` - Extract the children entry from a props type
- `PropsWithoutChildren<TProps>` / `PartialWithoutChildren<TProps>` - Remove children while preserving unions
- `FunctionComponent<TProps>` - A function component type without the children handling complications of React.FC
- `DirectComponent<TProps>` - A function component marked for direct rendering
- `PhasedComponent<TProps>` - A component with two-phase rendering support
- `PhasedRender<TProps>` - The render signature for phased components (phase one returns the phase two renderer)
- `SlotComponent<TProps>` - Slot component type used in the composition framework
- `PropsTransform<TPropsIn, TPropsOut>` - A transform that maps one set of props to another
- `ComponentPropsTransform<TComponent>` - A transform for the resolved props of a component type
- `SlotOptions<TComponent>` - Default props, transform, and optional-slot rendering behavior
- `Simplify<T>`, `OuterPartial<T>`, and `PartialExcept<T, K>` - Helpers for producing readable partial object types
- `MergeCoreOptions` - Options accepted by `immutableMergeCore`
- `ValueFactory<T>` - Factory signature accepted by memo cache functions
