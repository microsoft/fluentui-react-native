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
- `icon`
- `onClick`
- `testID`
- `tooltip`

### Props no longer supported with an equivalent functionality in v1 Button

- `componentRef` => Use `ref` instead
- `content` => Pass the content as `children` instead
- `endIcon` => Use `after` value for `iconPosition` prop and pass icon information into `icon` prop instead
- `startIcon` => Use `before` value for `iconPosition` prop and pass icon information into `icon` prop instead

### Props no longer supported without an equivalent functionality in v1 Button

- Cannot use both `startIcon` and `endIcon` at the same time in v1

## Property mapping

| v0 `Button`    | v1 `Button`    |
| -------------- | -------------- |
| `componentRef` | `ref`          |
| `content`      |                |
| `endIcon`      | `iconPosition` |
| `icon`         | `icon`         |
| `onClick`      | `onClick`      |
| `statIcon`     | `iconPosition` |
| `tooltip`      | `tooltip`      |
