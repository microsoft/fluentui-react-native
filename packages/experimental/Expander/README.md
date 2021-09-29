# @fluentui-react-native/experimental-expander

This package provides a FluentUI React Native implementation of the [WinUI 2.6 Expander control](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.xaml.controls.expander?view=winui-2.6).

This component is only supported on Windows.

## Getting started

`$ npm install @fluentui-react-native/experimental-expander --save`

or

`$ yarn add @fluentui-react-native/experimental-expander`

After the package has been installed, run the following command to link the package.

`npx react-native autolink-windows`

## Usage

Import Expander from @fluentui-react-native/experimental-expander

`import { Expander } from @fluentui-react-native/experimental-expander`

Add `Expander` as follows:

```javascript
<Expander collapsedHeight={50} expandedHeight={100}>
  <Text>Text in the header</Text>
  <Text>Text in the content</Text>
</Expander>
```

The first child element of Expander will be assigned to the header, and the second child element will be assigned to the content. If you would like multiple components in the header or the content, wrap them in `View` as follows:

```javascript
<Expander collapsedHeight={75} expandedHeight={150}>
  <View>
    <Text>Text in the header</Text>
    <Text>Second line of text in the header<Text>
  </View>
  <View>
    <Text>Text in the content</Text>
    <Text>Second line of text in the content<Text>
  </View>
</Expander>
```

### Props

- [`expandDirection`](#expanddirection)
- [`expanded`](#expanded)
- [`enabled`](#enabled)
- [`height`](#height)
- [`expandedHeight`](#expandedheight)
- [`collapsedHeight`](#collapsedheight)
- [`onCollapsing`](#oncollapsing)
- [`onExpanding`](#onexpanding)

### Tokens

- [`width`](#width)
- [`contentHorizontalAlignment`](#contenthorizontalalignment)
- [`contentVerticalAlignment`](#contentverticalalignment)
- [`headerBackground`](#headerbackground)
- [`headerForeground`](#headerforeground)
- [`headerForegroundPointerOver`](#headerforegroundpointerover)
- [`headerForegroundPressed`](#headerforegroundpressed)
- [`headerBorderBrush`](#headerborderbrush)
- [`headerBorderPointerOverBrush`](#headerborderpointeroverbrush)
- [`headerBorderPressedBrush`](#headerborderpressedbrush)
- [`headerDisabledForeground`](#headerdisabledforeground)
- [`headerDisabledBorderBrush`](#headerdisabledborderbrush)
- [`headerBorderThickness`](#headerborderthickness)
- [`contentBackground`](#contentbackground)
- [`contentBorderBrush`](#contentborderbrush)
- [`chevronBackground`](#chevronbackground)
- [`chevronForeground`](#chevronforeground)
- [`chevronPointerOverBackground`](#chevronpointeroverbackground)
- [`chevronPointerOverForeground`](#chevronpointeroverforeground)
- [`chevronPressedBackground`](#chevronpressedbackground)
- [`chevronPressedForeground`](#chevronpressedforeground)
- [`chevronBorderThickness`](#chevronborderthickness)
- [`chevronBorderBrush`](#chevronborderbrush)
- [`chevronBorderPointerOverBrush`](#chevronborderpointeroverbrush)
- [`chevronBorderPressedBrush`](#chevronborderpressedbrush)

### Important notes

- `collapsedHeight` and `expandedHeight` must be set for Expander to display correctly. There is no need to set the `height` prop.
- Non-native components within the header will not be interactable (i.e. if there is a `Button` in the header, and you press it, the Expander will expand, and the `Button` functionality will not be performed). We recommend using [react-native-xaml](https://github.com/asklar/react-native-xaml) controls in the header if you would like an interactive control that does not have a native implementation.

---

# Reference

## Props

### `expandDirection`

Specifies the direction that the Expander should expand.

* 'down': Expands downward. This is the default.
* 'up': Expands upward.

| Type               | Required |
| ------------------ | -------- |
| enum('up', 'down') | No       |

---

### `expanded`

Specifies if the Expander is expanded. Default is `false`.

| Type    | Required |
| ------- | -------- |
| boolean | No       |

---

### `enabled`

If set to false, the Expander will be disabled, i.e. the user will not be able to expand it.

| Type    | Required |
| ------- | -------- |
| boolean | No       |

---

### `height`

Sets the height of the Expander. In order to maintain expand/collapse functionality, do not set this value. Instead, use `collapsedHeight` and `expandedHeight`.

| Type   | Required |
| ------ | -------- |
| number | No       |

---

### `expandedHeight`

Sets the height of the Expander while it is expanded.

| Type   | Required  |
| ------ | --------- |
| number | Yes       |

---

### `collapsedHeight`

Sets the height of the Expander while it is collapsed.

| Type   | Required  |
| ------ | --------- |
| number | Yes       |

---

### `onCollapsing`

Callback for when the Expander begins to collapse.

| Type     | Required |
| -------- | -------- |
| function | No       |

---

### `onExpanding`

Callback for when the Expander begins to expand.

| Type     | Required |
| -------- | -------- |
| function | No       |

---

## Tokens

### `width`

Sets the width of the Expander.

| Type   | Required |
| ------ | -------- |
| number | No       |

---

### `contentHorizontalAlignment`

Sets the horizontal alignment of the Expander's content.

* 'center': The content is aligned in the center of the Expander.
* 'left': The content is aligned to the left of the Expander.
* 'right': The content is aligned to the right of the Expander.
* 'stretch': The content will stretch to fit the Expander.

| Type                                       | Required |
| ------------------------------------------ | -------- |
| enum('center', 'left', 'right', 'stretch') | No       |

---

### `contentVerticalAlignment`

Sets the vertical alignment of the Expander's content.

* 'bottom': The content is aligned to the bottom of the Expander.
* 'center': The content is aligned in the center of the Expander.
* 'stretch': The content will stretch to fit the Expander.
* 'top': The content is aligned to the top of the Expander.

| Type                                       | Required |
| ------------------------------------------ | -------- |
| enum('bottom', 'center', 'stretch', 'top') | No       |

---

### `headerBackground`

Header background color. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `headerForeground`

Header foreground color at rest. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `headerForegroundPointerOver`

Header foreground color on pointer over. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `headerForegroundPressed`

Header foreground color when pressed. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `headerBorderBrush`

Header border color at rest. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `headerBorderPointerOverBrush`

Header border color on pointer over. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `headerBorderPressedBrush`

Header border color when pressed. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `headerDisabledForeground`

Header foreground color when disabled. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `headerDisabledBorderBrush`

Header border color when disabled. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `headerBorderThickness`

Header border thickness.

| Type   | Required |
| ------ | -------- |
| number | No       |

---

### `contentBackground`

Content background color. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `contentBorderBrush`

Content border color. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `chevronBackground`

Chevron background color at rest. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `chevronForeground`

Chevron foreground color at rest. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `chevronPointerOverBackground`

Chevron background color on pointer over. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `chevronPointerOverForeground`

Chevron foreground color on pointer over. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `chevronPressedBackground`

Chevron background color when pressed. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `chevronPressedForeground`

Chevron foreground color when pressed. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `chevronBorderThickness`

Chevron border thickness.

| Type   | Required |
| ------ | -------- |
| number | No       |

---

### `chevronBorderBrush`

Chevron border color at rest. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `chevronBorderPointerOverBrush`

Chevron border color on pointer over. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |

---

### `chevronBorderPressedBrush`

Chevron border color when pressed. Input value should be hexadecimal string or a [predefined color name](https://docs.microsoft.com/en-us/windows/winui/api/microsoft.ui.colors?view=winui-3.0) string.

| Type   | Required |
| ------ | -------- |
| string | No       |
