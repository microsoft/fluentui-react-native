# Label usage

Use Label to name a form control. Pair it with the control it describes and wire the association so assistive technology reads them together.

```tsx
import { Input, Label } from '@fluentui-react-native/agentic-components';

<Label content="Display name" nativeID="display-name-label" required />
<Input accessibilityLabelledBy="display-name-label" />;
```

Choose `weight` by the emphasis the layout needs, not by the control it names. `regular` reads at the same rank as surrounding content and is the default. `strong` gives the label semibold emphasis so it stands apart from the value it introduces. Either weight pairs with any control.

Match `size` to the size of the associated control so a field composes as a coherent pair. `small` suits dense surfaces, `medium` is the general-purpose default, and `large` suits high-touch forms and settings surfaces.

Set `required` when the associated control must be completed. The indicator is decorative, so also mark the control itself required through its own accessibility state. Set `disabled` only to mirror a disabled control; it changes color and nothing else.

Supply the label text through `content` rather than through children. `content` accepts a string, slot props, or an `as` replacement, and the same is true of `requiredIndicator` when a caller needs a different indicator glyph. When `content` is not a string, set `accessibilityLabel` so the label still reports a name.

Do not use Label as a generic text style: use `Text` for standalone content. Do not use it as a heading, a caption, a helper-text element, or a validation message, and do not attach press handling to it.

Label does not own the spacing between itself and its control. Leave that to the surrounding form layout so every field in a form stays consistent.
