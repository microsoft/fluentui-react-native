# Spinner

## Background

The `Spinner` is an outline of a circle which animates around itself, to visually indicate that something is processing. Spinners are indeterminate progress indicators meaning that they are used when it is unknown how long a task will take to complete.

### Best Practices

- Use a Spinner when a task is not immediate
- Use one Spinner at a time
- Descriptive verbs are paired with a Spinner to help the user understand what is happening. Ie. Saving, processing, updating.
- Use a Spinner when confirming a change has been made or a task is being processed

## Sample Code

### Basic Mobile Spinner

```tsx
<>
  <Spinner /> // This is a spinner with default size as 'medium'
  <Spinner size="x-small" /> // Spinner with a defined size
  <Spinner status={status} /> // 'status' property depicts it is rotating or not
  <Spinner hidesWhenStopped={hidesWhenStopped} /> // 'hidesWhenStopped' boolean property decides it will be hidden or not when stopped
</>
```

### Spinner Sizes

```tsx
<>
  <Spinner size="xx-small" />

  <Spinner size="x-small" />

  <Spinner size="medium" />

  <Spinner size="large" />

  <Spinner size="x-large" />
</>
```

## Variants

Label postion decides where will the label place with respect to Spinner :

- If `labelPosition` is equal to "above", then the Label appears be vertically above with respect to Spinner.
- If `labelPosition` is equal to "below", then the Label appears be vertically below with respect to Spinner.
- If `labelPosition` is equal to "before", then the Label appears be horizontally before with respect to Spinner.
- If `labelPosition` is equal to "after", then the Label appears be horizontally after with respect to Spinner.

#### Status

Users can control whether `Spinner` is animating or not :

- If `status` is equal to "active", then the `Spinner` appears to be animating.
- If `status` is equal to "inactive",then the `Spinner` appears to be stopped.

#### Size

Users can control the `Spinner` size from the configuration below :

| Size     | Diameter (height/width) | Line Thickness   |
| -------- | ----------------------- | ---------------- |
| xx-small | 12 (iconSize120)        | 1 (stokeWidth10) |
| x-small  | 16 (iconSize160)        | 1 (stokeWidth10) |
| medium   | 24 (iconSize240)        | 2 (stokeWidth20) |
| large    | 32                      | 3 (stokeWidth30) |
| x-large  | 40 (iconSize360)        | 4 (stokeWidth40) |

#### Label Postion

Label postion decides where will the label place with respect to Spinner :

- If `labelPosition` is equal to "above", then the Label appears be vertically above with respect to Spinner.
- If `labelPosition` is equal to "below", then the Label appears be vertically below with respect to Spinner.
- If `labelPosition` is equal to "before", then the Label appears be horizontally before with respect to Spinner.
- If `labelPosition` is equal to "after", then the Label appears be horizontally after with respect to Spinner.

## API

### Slots

The `Spinner` uses 5 slots on win32 and 2 slots on mobile platforms:

Win32 Slots

- `root` [View] The outer container of the component
- `track` [Svg]The container for the spinner svg .
- `tail` [Svg] The svg of the tail that will act as animated spinner
- `tailContainer` [RCTNativeAnimatedSpinner] The Container for the tail of the spinner
- `label` [TextV1] If specified, renders the name of the passed value as text.

Mobile Slots

- `root` [View]\* The outer container of the component
- `svg` [Svg]\* The container for the svg spinner.

### Props

Below is the set of props `Spinner` supports.

```tsx
export interface SpinnerProps extends ViewProps, SpinnerTokens {
  /**
   * Spinner appearnace
   * @defaultValue 'primary'
   * Note: This is not supported on mobile platforms
   */
  appearance?: SpinnerAppearance;
  /**
   * Spinner label position
   * @defaultValue 'after'
   * Note: This is not supported on mobile platforms
   */
  labelPosition?: SpinnerLabelPosition;
  /**
   * Spinner size
   * @defaultValue 'medium'
   */
  size?: SpinnerSize;
  /**
   * Spinner animating or not
   * @defaultValue 'active'
   */
  status?: SpinnerStatus;
  /**
   * Spinner label
   * Note: This is not supported on mobile platforms
   */
  label?: string;
  /**
   * Spinner hidden when not animating or not hidden
   * @defaultValue 'true'
   * @platform android
   */
  hidesWhenStopped?: boolean;
}
```

### Styling Tokens

Tokens can be used to customize the styling of the control by using the customize function on the `Spinner`. For more information on using the customize API, please see [this page](https://github.com/microsoft/fluentui-react-native/blob/main/packages/framework/composition/README.md). The `Spinner` has the following tokens:

```tsx
export interface SpinnerTokens {
  /**
   * Spinner element color
   */
  trackColor?: string;
  /**
   * Spinner element color
   * Note: This is not supported on mobile platforms
   */
  tailColor?: string;
  /**
   * Size of the Spinner view
   * @defaultValue 'medium'
   */
  size?: SpinnerSize;
}
```
