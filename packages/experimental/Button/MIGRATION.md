# Button Migration

## STATUS: WIP 🚧

This Migration guide is a work in progress and is not yet ready for use.

## Migration from v0 Button

### Component renames

Primary and Stealth buttons now map to `Button`:

| v0 `Button`                             | v1 `Button`                                          |
| --------------------------------------- | ---------------------------------------------------- |
| `<Button content="Hello, world" />`        | `<Button>Hello, world</Button>`                      |
| `<PrimaryButton content="Hello, world" />` | `<Button appearance='primary'>Hello, world</Button>` |
| `<StealthButton content="Hello, world" />` | `<Button appearance='subtle'>Hello, world</Button>`  |

### Props that remain as is

- Any props that are part of `ViewProps`
- `children`
- `componentRef`
- `icon`
- `onClick`
- `testID`
- `tooltip`

### Props no longer supported with an equivalent functionality in v1 Button

- `content` => Pass the content as `children` instead
- `endIcon` => Use `after` value for `iconPosition` prop and pass icon information into `icon` prop instead
- `startIcon` => Use `before` value for `iconPosition` prop and pass icon information into `icon` prop instead

### Props no longer supported without an equivalent functionality in v1 Button

- Cannot use both `startIcon` and `endIcon` at the same time in v1

### Updating ThemeProvider

If you are using the older theme provider `ThemeProvider` from `@uifabricshared/theming-react-native`, you will need to update the `ThemeProvider` to pull from `@fluentui-react-native/theme` to have the control work properly with themes. Please see [this page](../../../docs/pages/Guides/UpdateThemeProvider.md) for guidance.

### Migrating customized Buttons

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

If you were using `PrimaryButton` or `StealthButton`, any color customizations will need to be applied under the `primary` and `subtle` tokens, respectively:

```ts
const Custom = StealthButton.customize({
  tokens: {
    borderWidth: 0,
    color: 'white',
    backgroundColor: 'red',
  }
});
```

would become

```ts
const Custom = Button.customize({
  subtle: {
    borderWidth: 0,
    color: 'white',
    backgroundColor: 'red',
  }
});
```

### Migrating composed Buttons

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.


## Porting from FluentUI v9 Button

The FURN button cannot be used in place of a FluentUI button - these buttons are intended to be used on their respective platforms. See [this porting guide](../../../docs/pages/Guides/PortingFromFluentUI.md) for general guidance on coming from FluentUI to FURN.

### Props that remain as is

- `children`
- `disabled`
- `icon`
- `onClick`
- `testID`
- `tooltip`

### Props renamed to align with ReactNative

No `Button` specific renames.

### Prop differences due to technical differences and limitations

- `icon` takes in a props object instead of the JSX element itself. This is due to framework differences from FluentUI.
- `iconOnly` must be supplied for components do not have any text content for them to be styled correctly. This is due to framework differences from FluentUI.
- `ref` is exposed as `componentRef`, similar to previous versions of FluentUI. This is due to framework differences from FluentUI.

### Other Prop differences

- `appearance` does not include values for `transparent` or `outline` as neither currently are used by native platforms.
- `iconPosition` uses `before` and `after` as values instead of `left` and `right` for better right to left support.

## Property mapping

| v0 `Button`    | v1 `Button`    |
| -------------- | -------------- |
| `componentRef` | `componentRef` |
| `content`      |                |
| `disabled`     | `disabled`     |
| `endIcon`      | `iconPosition` |
| `icon`         | `icon`         |
| `onClick`      | `onClick`      |
| `statIcon`     | `iconPosition` |
| `testId`       | `testId`       |
| `tooltip`      | `tooltip`      |
