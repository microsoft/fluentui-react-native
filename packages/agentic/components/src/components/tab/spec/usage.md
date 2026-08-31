# Tab usage

## When to use

Use tabs to switch between peer views of the same subject where only one view is
visible at a time and the user can move freely between them: Overview, Activity,
Files. Keep the set small and stable; tabs are a poor fit for a long or
changing list.

Do not use tabs for navigation that changes the address of the app; use links or
a navigation surface. Do not use them for a step-by-step flow, which needs a
wizard, or for filtering a single list, which is a filter control. Do not use a
tab as a toggle for an option.

## Group selection

Use TabList to coordinate selection, list semantics, and roving keyboard focus:

```tsx
import { Tab, TabList } from '@fluentui-react-native/agentic-components';

const [selected, setSelected] = React.useState('overview');

<TabList selectedValue={selected} onSelectionChange={setSelected}>
  <Tab value="overview" controls="overview-panel" content="Overview" />
  <Tab value="activity" controls="activity-panel" content="Activity" />
</TabList>;
```

Omit `selectedValue` and use `defaultSelectedValue` for an uncontrolled group.
When `value` is omitted from a Tab, TabList uses its `controls` identifier.

Render the panel yourself and give it the identifier each tab points at:

```tsx
<View nativeID="overview-panel">{selected === 'overview' ? <Overview /> : null}</View>
```

## Icons

Supply `icon` for the resting state and `selectedIcon` for the selected state,
usually the filled variant of the same glyph. When only `icon` is supplied it is
used in both states.

```tsx
<Tab
  controls="activity-panel"
  selected={isActivity}
  icon={<Icon svg={ActivityRegular} />}
  selectedIcon={<Icon svg={ActivityFilled} />}
  content="Activity"
/>
```

Do not size or color the icon yourself; the tab applies its own size and the
resolved foreground so the icon and the label always match.

## Icon-only tabs

```tsx
<Tab layout="iconOnly" controls="activity-panel" accessibilityLabel="Activity" icon={<Icon svg={ActivityRegular} />} />
```

The icon-only layout requires both an icon and an `accessibilityLabel` and
rejects `content`; all three are enforced by the compiler. Use it only when the
glyphs are unambiguous on their own, and keep a whole group icon-only rather
than mixing layouts in one row.

## Standalone control

Tab can still participate in a custom caller-owned group. In that case pass
`selected`, handle `onPress`, and own the list semantics and keyboard model.
Prefer TabList for ordinary tab groups so only one enabled Tab enters the native
tab order.

## Disabled tabs

```tsx
<Tab controls="files-panel" disabled content="Files" />
```

A disabled tab cannot be focused or pressed but still reports its disabled
state. Prefer removing a tab that will never be available over leaving a
permanently dead one in the row.

## Common mistakes

Passing both standalone `selected` state and TabList selection. The parent
context owns selection while a Tab is grouped.

Pointing several tabs at the same `controls` identifier, which breaks the
relationship between each tab and its panel.

Labeling an icon-only tab after its glyph instead of after the panel it shows.
