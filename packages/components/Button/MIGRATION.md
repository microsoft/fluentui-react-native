# Button Migration

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

## Porting from FluentUI v9 Button

The FURN button cannot be used in place of a FluentUI button - these buttons are intended to be used on their respective platforms.

### Props that remain as is

- `children`
- `disabled`
- `icon`
- `onClick`
- `testID`
- `tooltip`

### Props renamed to align with ReactNative

No `Button` specific renames. See [this porting guide](../../../docs/pages/Guides/PortingFromFluentUI.md) for general guidance.

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
