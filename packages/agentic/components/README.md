# `@fluentui-react-native/components`

Agentic Fluent UI React Native components for macOS, React Native Windows, and Office Win32. Each higher-order component
has an original React Native contract (`SPEC.md`), Flex token styling from `@fluentui-react-native/design`, native focus
and accessibility behavior, and colocated tests and stories.

| Entry point                                    | Contents                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `@fluentui-react-native/components`            | Higher-order components, public types, and component-qualified `_unstable` state, style, and render stages     |
| `@fluentui-react-native/components/primitives` | Unstyled building blocks: `CheckboxIndicator`, `CompoundItemLayout`, `FocusVisual`, `Icon`, `LayoutStableText` |
| `@fluentui-react-native/components/macos`      | AppKit-backed previews: Dialog, Rating, Select, Slider, and SpinButton                                         |

Higher-order components: Accordion, Avatar, AvatarGroup, Badge, Breadcrumb, Button, Card, Checkbox, CompoundButton,
DestructiveButton, Divider, Drawer (inline), Dropdown, Field, InfoLabel, Input, InteractionTag, Label, Link (standalone),
List (mounted passive/items), ListItem, ListboxItem, Menu, MenuButton, MenuItem, MessageBar, Nav, NavItem, Persona,
Popover, PresenceBadge, ProgressBar, Radio, RadioGroup, RatingDisplay, Scrollbar (native owner), SearchBox, SimpleNav,
Skeleton, Spinner, SplitButton, Swatch, SwatchPicker, Switch, Tab, TabList, Tag, TagPicker (select-only), TeachingPopover,
Text, Textarea, ToggleButton, Toolbar, Tree, and TreeItem.

The macOS-only previews require a consuming app that directly autolinks `@fluentui-react-native/native-core`.
See `@fluentui-react-native/native-core/README.md` for integration. Their public component previews are not
admitted on Windows or Win32. Native-core includes a Windows Fabric RangeTarget preview used by the isolated
Rating and Slider UIA cases; it does not add a Win32 registration. The overlay modes of Nav and SimpleNav use
the same AppKit dialog scope.

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
For components not in the public list above, see the [draft review order](references/remaining-work.md#catalog-draft-review-order).
A draft specifies proposed behavior; it does not mean the component can be imported.

For native desktop tooltip text, pass `tooltip` directly to a supported view-backed component, for example
`<Button content="Save" tooltip="Save a local copy" />`. This forwards text to the host, not an accessible name or
description. The [Tooltip contract](src/components/tooltip/SPEC.md) distinguishes the direct prop from the compatibility wrapper.

## Documentation

| Topic                                                            | Covers                                                               |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Higher-order components](references/higher-order-components.md) | Component structure, invariants, and the shared focus visual policy  |
| [Primitives](references/primitives.md)                           | The primitive catalog and contracts                                  |
| [Contracts](references/contracts.md)                             | Contract provenance, lifecycle, source adapters, and drift checks    |
| [Tests and stories](references/tests-and-stories.md)             | Runtime, type, and Storybook coverage, including native story tests  |
| [Contributing](references/contributing.md)                       | Source ownership, test commands, and validation                      |
| [Remaining work](references/remaining-work.md)                   | Open focus qualification, missing components, and contract decisions |

The [reference index](references/README.md) lists every reference by ID. Agents working in this package start from
[AGENTS.md](AGENTS.md).
