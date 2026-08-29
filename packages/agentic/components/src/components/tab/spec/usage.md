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

## Owning selection

Tab renders the selection it is given and reports presses. The caller keeps the
value:

```tsx
import { Tab } from '@fluentui-react-native/agentic-components';

const [selected, setSelected] = React.useState('overview');

<View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 4 }}>
  <Tab controls="overview-panel" selected={selected === 'overview'} onPress={() => setSelected('overview')} content="Overview" />
  <Tab controls="activity-panel" selected={selected === 'activity'} onPress={() => setSelected('activity')} content="Activity" />
</View>;
```

Exactly one tab in a group should be selected at a time. The component does not
enforce that, so a caller that sets `selected` on two tabs will render two
selected tabs.

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

## Keyboard navigation

This package ships no list container, so a plain group of tabs is reached by tab
order, one stop per tab. If the group is long enough that this is tedious, the
caller implements roving focus over the tabs and manages `focusable` itself. If
you add arrow-key movement, decide once whether selection follows focus and
apply it consistently across the app.

## Disabled tabs

```tsx
<Tab controls="files-panel" disabled content="Files" />
```

A disabled tab cannot be focused or pressed but still reports its disabled
state. Prefer removing a tab that will never be available over leaving a
permanently dead one in the row.

## Common mistakes

Expecting a press to select the tab. Selection only moves when the caller passes
a new `selected` value.

Pointing several tabs at the same `controls` identifier, which breaks the
relationship between each tab and its panel.

Labeling an icon-only tab after its glyph instead of after the panel it shows.
