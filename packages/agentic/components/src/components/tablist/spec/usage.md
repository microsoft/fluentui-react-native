# TabList usage

## Uncontrolled selection

Use an explicit value when selection state should not be coupled to the panel
identifier:

```tsx
<TabList defaultSelectedValue="overview" onSelectionChange={setPanel}>
  <Tab value="overview" controls="overview-panel" content="Overview" />
  <Tab value="activity" controls="activity-panel" content="Activity" />
</TabList>
```

When `value` is omitted, TabList uses `controls` as the value:

```tsx
<TabList defaultSelectedValue="overview-panel">
  <Tab controls="overview-panel" content="Overview" />
  <Tab controls="activity-panel" content="Activity" />
</TabList>
```

## Controlled selection

```tsx
const [selectedValue, setSelectedValue] = React.useState('overview');

<TabList selectedValue={selectedValue} onSelectionChange={setSelectedValue}>
  <Tab value="overview" controls="overview-panel" content="Overview" />
  <Tab value="activity" controls="activity-panel" content="Activity" />
</TabList>;
```

Render panel content separately and keep every `controls` identifier paired with
the corresponding panel `nativeID`.

## Vertical and manual activation

```tsx
<TabList orientation="vertical" selectionFollowsFocus={false} accessibilityLabel="Settings sections">
  <Tab value="profile" controls="profile-panel" content="Profile" />
  <Tab value="privacy" controls="privacy-panel" content="Privacy" />
</TabList>
```

Up and Down move focus in a vertical list. With manual activation, moving focus
does not change selection until the focused Tab is activated.

## Disabled Tabs

Disabled Tabs remain announced in their set position but are skipped by
keyboard movement. Avoid disabling every Tab unless the entire surface is
temporarily unavailable; a fully disabled TabList has no keyboard entry point.

## Common mistakes

Do not provide duplicate values, mix controlled `selectedValue` with selection
state owned independently by child `onPress` handlers, or render a controlled
TabList without applying `onSelectionChange` to its value.
