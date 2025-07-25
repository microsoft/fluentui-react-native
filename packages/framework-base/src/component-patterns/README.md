# `fluentui-react-native` - Common component patterns

These are the base component patterns shared across the deprecated framework, and the newer framework. This also includes the custom JSX handlers required to render them properly.

There are two main patterns exposed here: direct rendering and staged rendering.

## Direct Rendering

The direct rendering pattern allows a component to be called directly, rather than creating a new entry in the DOM.

As an example, if you want to create a wrapper around a component called `MyText` that has `italicize` as one of its props, that always wants to set that value to true. You could define:

```ts
const MyNewText: React.FunctionComponent<MyTextProps> = (props) => {
  return <MyText {...props, italicize: true} />;
}
```

When this is rendered, there is an entry for `MyNewText` which contains a `MyText` (another entry), which might contains `Text` (for react-native usage). The direct rendering pattern is one where a component can denote that it is safe to be called directly as a function, instead operating as a prop transform that gets applied to the underlying component.

- For the above to be safe, `MyNewText` should NOT use hooks. In the case of any conditional rendering logic this will break the rule of hooks.

There are two types of implementations in this folder:

- `DirectComponent` - a functional component that marks itself as direct with a `_callDirect: true` attached static. This will then be called as a normal function component, with children included as part of props.
- `LegacyDirectComponent` - the pattern currently used in this library that should be moved away from. In this case `_canCompose: true` is set as an attached static, and the function component will be called with children split from props.

The internal logic of the JSX rendering helpers will handle both patterns. In the case of the newer `DirectComponent` pattern, the component will still work, even without any jsx hooks, whereas the `LegacyDirectComponent` pattern will have a somewhat undefined behavior with regards to children.

## Staged Rendering

The issue with the direct component pattern above, is that hooks are integral to writing functional components. The staged rendering pattern is designed to help with this. In this case a component is implemented in two stages, the prep stage where hooks are called, and the rendering stage where the tree is emitted.

As above there is a newer and older version of the pattern.

- `StagedComponent` - the newer version of the pattern, where the returned component function expects children as part of props.
- `StagedRender` - the older version, where children are split out and JSX hooks are required to render correctly.

Note that while the newer patterns work without any JSX hooks, the hooks will enable the layer removal.
