# Switch usage

## When to use

Use a switch for a setting that takes effect the moment it is changed and that
reads naturally as on or off: notifications, sync, a preview mode. The user
should be able to flip it and move on with no confirmation step.

Use a checkbox instead when the value is submitted later with the rest of a
form, when the choice is one of several in a list, or when a third
indeterminate state is possible. Use a toggle button instead when the control
belongs in a toolbar and reads as a pressed tool rather than a setting.

Do not use a switch for a destructive or irreversible action; that needs a
button and a confirmation.

## Basic usage

```tsx
import { Switch } from '@fluentui-react-native/agentic-components';

<Switch label="Show read receipts" labelBefore={false} onChange={setShowReceipts} />;
```

`layout` defaults to `horizontal`, and both `labelBefore` and `labelAfter`
default to `true`, so the default rendering repeats the label on both sides of
the control. Pick a side explicitly by turning the other one off.

## Layouts

```tsx
<Switch layout="horizontal" labelBefore={false} label="Automatic updates" />
<Switch layout="vertical" label="Automatic updates" />
<Switch layout="switch" accessibilityLabel="Automatic updates" />
```

Use `horizontal` in a settings row, `vertical` when the label must sit above the
control in a narrow column, and `switch` when the surrounding surface already
provides a visible label. The `switch` layout renders no text at all, so it
always needs an explicit `accessibilityLabel`.

## Owning the value

Leave `checked` unset to let the switch own its value, and read the result from
`onChange`:

```tsx
<Switch label="Sync over cellular" labelBefore={false} defaultChecked onChange={saveSetting} />
```

Supply `checked` when the value lives somewhere else, such as a store or a
server round trip. The rendered value then only moves when the new value comes
back, which is the correct behavior for a setting that can fail to save:

```tsx
<Switch label="Sync over cellular" labelBefore={false} checked={settings.syncOverCellular} onChange={(next) => void saveSetting(next)} />
```

Never supply `checked` and then ignore `onChange`; the switch will visibly
refuse to move.

## Composing a settings row

Switch lays out only its own labels. Descriptions, icons, and row chrome belong
to the caller, and a description is not part of the accessible name unless the
caller wires it up.

```tsx
<View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
  <View style={{ flexShrink: 1 }}>
    <Text>Automatic updates</Text>
    <Text>Install updates as soon as they are available</Text>
  </View>
  <Switch layout="switch" accessibilityLabel="Automatic updates" checked={auto} onChange={setAuto} />
</View>
```

## Disabled state

```tsx
<Switch label="Automatic updates" labelBefore={false} disabled checked={auto} />
```

A disabled switch keeps reporting its value and its disabled state, so it can
still be read; it simply cannot be focused or changed. When a setting is
unavailable for a reason the user can fix, say so in nearby text rather than
leaving a dead control with no explanation.

## Common mistakes

Putting the current value in the label, as in "Notifications: on". The state is
announced from the control and shown by the track, so a value in the label goes
stale and reads twice.

Leaving both label sides on when only one is wanted, which silently duplicates
the text.

Expecting a press on the label text to toggle the control. Only the hit area is
pressable.
