# Text usage

Use Text for standalone textual content and as the base component for text
slots in agentic components.

```tsx
import { Text } from '@fluentui-react-native/agentic-components';

<Text selectable>Theme-aware body text</Text>;
<Text style={{ fontSize: 20 }}>Caller style wins</Text>;
```

Text accepts the React Native Text ref directly as an ordinary React 19 prop.
It does not require `forwardRef`.

Raw string children and raw React Native Text descendants inherit native text
styles. A nested Agentic Text instance starts a new theme-default boundary, and
its own style can override those defaults.

Keep component-specific typography in the owning component. Text supplies
fallback body typography and primary foreground color; it is not a replacement
for a component's display, label, caption, or interaction-state token
bindings.
