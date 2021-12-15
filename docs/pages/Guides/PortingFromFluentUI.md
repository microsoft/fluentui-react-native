# Porting from FluentUI

FURN is a React Native based component library, so there will be a few differences in props and behaviors if you are porting components from FluentUI.

## Common Prop Renames

- `onClick` is `onPress`
- `aria-label` is `accessibilityLabel`
- `aria-hidden` is `accessible` set to false
- `aria-description` has no direct equivalent, use `accessibilityHint` to give more detail on what happens when an action is invoked on a component

## Styling

CSS is not available in React Native, so styling must be applied to elements directly instead of using classNames or selectors. A good way to ensure that styles are passed through a tree is to use a `ThemeProvider`. More information about our theming can be found [here](https://github.com/microsoft/fluentui-react-native/tree/master/docs/pages/Theming)
