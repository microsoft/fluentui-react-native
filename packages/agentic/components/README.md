# `@fluentui-react-native/components`

Agentic Fluent UI React Native components for macOS, React Native Windows, and Office Win32. Each higher-order component
has an original React Native contract (`SPEC.md`), Flex token styling from `@fluentui-react-native/design`, native focus
and accessibility behavior, and colocated tests and stories.

| Entry point                                    | Contents                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `@fluentui-react-native/components`            | Higher-order components, public types, and component-qualified `_unstable` state, style, and render stages     |
| `@fluentui-react-native/components/primitives` | Unstyled building blocks: `CheckboxIndicator`, `CompoundItemLayout`, `FocusVisual`, `Icon`, `LayoutStableText` |
| `@fluentui-react-native/components/test`       | Runtime-safe Storybook/test UI: `StoryGroup`, `StoryItem`, `StoryStatus`, `ThemePicker`, `ThemeTester`         |

Higher-order components: Accordion, Avatar, Badge, Button, Card, Checkbox, Divider, Dropdown, Input, ListItem,
ListboxItem, Menu, MenuButton, MenuItem, Popover, ProgressBar, Radio, Skeleton, Spinner, Switch, Tab, TabList, Tag, and
Text.

## Quick start

The package requires React 19.1.4. Render components inside a `ThemedRoot` from `@fluentui-react-native/design`, which
provides the theme and the scene's input modality:

```tsx
import { ThemedRoot } from '@fluentui-react-native/design';
import { Button } from '@fluentui-react-native/components';

export const App = () => (
  <ThemedRoot style={{ flex: 1 }}>
    <Button appearance="primary" content="Save" onPress={() => console.log('pressed')} />
  </ThemedRoot>
);
```

Each component's `src/components/<name>/SPEC.md` describes its supported props, behavior, and platform differences.

## Documentation

| Topic                                                            | Covers                                                               |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Higher-order components](references/higher-order-components.md) | Component structure, invariants, and the shared focus visual policy  |
| [Primitives](references/primitives.md)                           | The primitive catalog and contracts                                  |
| [Test components](references/test-components.md)                 | Shared Storybook and test UI components and their local contracts    |
| [Contracts](references/contracts.md)                             | Contract provenance, lifecycle, source adapters, and drift checks    |
| [Tests and stories](references/tests-and-stories.md)             | Runtime, type, and Storybook coverage, including native story tests  |
| [Contributing](references/contributing.md)                       | Source ownership, test commands, and validation                      |
| [Remaining work](references/remaining-work.md)                   | Open focus qualification, missing components, and contract decisions |

The [reference index](references/README.md) lists every reference by ID. Agents working in this package start from
[AGENTS.md](AGENTS.md).
