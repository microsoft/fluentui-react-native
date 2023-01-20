# Text

A cross-platform Text component using the Fluent Design System.

Text elements can be specified either by passing a `variant` [typography token](../../../docs/pages/Theming/Tokens/Basics.md#typography) into a `TextV1` element or by using predefined JSX types. For example:

```tsx
import { Body1, TextV1 } from '@fluentui-react-native/text';

const myText = <TextV1 variant="body1">Here is some body text</TextV1>;
const moreText = <Body1>Here is some more body text</Body1>;
```

The former is better if you want to have more fine control over the appearance of your text, while the latter is better if you're looking for the simplest way to add a pre-styled text component.

Text V1 supported platforms: win32
