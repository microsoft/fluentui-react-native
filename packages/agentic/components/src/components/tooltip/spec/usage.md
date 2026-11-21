# Usage

Prefer the direct prop on a supported view-backed component:

```tsx
<Button content="Save draft" tooltip="Saves without publishing" onPress={saveDraft} />
```

This requests the host's text tooltip without changing the control's accessible name or help.
Supply any required accessible description on the trigger. Use the compatibility wrapper when the trigger
does not expose a typed `tooltip` but can forward it and the wrapper's accessibility props to the same native view:

```tsx
<Tooltip content="Saves the current draft without publishing">
  <Pressable accessibilityRole="button" accessibilityLabel="Save draft" onPress={saveDraft}>
    <Text>Save draft</Text>
  </Pressable>
</Tooltip>
```

This illustrates the reviewed wrapper API, not an available package export. Use one view-backed trigger that forwards
the native props and ref. Pass a short, localized string; set an independent accessible name for an icon-only
trigger. If the child already sets its own native `tooltip`, choose one owner (remove the prop or omit the wrapper).
Do not nest Tooltip wrappers, put a button in a tip, or put required validation or instructions only in a tip.
Use visible text for essential information and Popover for content a user needs to act on.
