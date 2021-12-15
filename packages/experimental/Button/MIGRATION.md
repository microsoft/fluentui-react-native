# Button Migration

## STATUS: WIP 🚧

This Migration guide is a work in progress and is not yet ready for use.

## Migration from v0 Button

### Component renames

Primary and Stealth buttons now map to `Button`:

| v0 `Button`                             | v1 `Button`                                          |
| --------------------------------------- | ---------------------------------------------------- |
| `<Button text="Hello, world" />`        | `<Button>Hello, world</Button>`                      |
| `<PrimaryButton text="Hello, world" />` | `<Button appearance='primary'>Hello, world</Button>` |
| `<StealthButton text="Hello, world" />` | `<Button appearance='subtle'>Hello, world</Button>`  |

### Props that remain as is

- `children`
- `disabled`
- `icon`
- `onClick`
- `testID`
- `tooltip`

### Props no longer supported with an equivalent functionality in v1 Button

- `componentRef` => Use `ref` instead
- `content` => Pass the content as `children` instead
- `endIcon` => Use `right` value for `iconPosition` prop and pass icon information into `icon` prop instead
- `startIcon` => Use `left` value for `iconPosition` prop and pass icon information into `icon` prop instead

### Props no longer supported without an equivalent functionality in v1 Button

- Cannot use both `startIcon` and `endIcon` at the same time in v1

## Migration from FluentUI v9 Button

### Props that remain as is

- `children`
- `disabled`
- `icon`
- `onClick`
- `testID`
- `tooltip`

### Props renamed to align with ReactNative

No `Button` specific renames. See [this porting guide](https://github.com/microsoft/fluentui-react-native/tree/master/docs/pages/Guides/PortingFromFluentUI.md) for general guidance.

### Prop differences due to technical differences and limitations

- `icon` takes in a props object instead of the JSX element itself. This is due to framework differences from FluentUI.
- `iconOnly` must be supplied for components do not have any text content for them to be styled correctly. This is due to framework differences from FluentUI.

### Other Prop differences

- `appearance` does not include values for `transparent` or `outline` as neither currently are used by native platforms.
- `iconPosition` uses `before` and `after` as values instead of `left` and `right` for better right to left support.

## Property mapping

| v0 `Button`    | v1 `Button`    |
| -------------- | -------------- |
| `children`     | `children`     |
| `componentRef` | `ref`          |
| `content`      |                |
| `disabled`     | `disabled`     |
| `endIcon`      | `iconPosition` |
| `icon`         | `icon`         |
| `onClick`      | `onClick`      |
| `statIcon`     | `iconPosition` |
| `testID`       | `testID`       |
| `tooltip`      | `tooltip`      |
