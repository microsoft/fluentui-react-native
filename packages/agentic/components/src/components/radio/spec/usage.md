# Radio usage

Render Radio options from a parent that owns the selected value. Keep labels
short and use supporting text only when it adds context to an option.

```tsx
<Radio
  label="Weekly"
  secondaryText="Receive one summary each week."
  showSecondaryText
  selected={frequency === 'weekly'}
  onPress={() => setFrequency('weekly')}
/>
```

Do not use one standalone Radio as an independent toggle. The current
component does not clear a selected peer or manage directional navigation, so
the surrounding group must perform those duties. Use `disabled` only for an
unavailable option, not to represent an unselected one.

## Scene root

Render the scene inside `ThemedRoot` so focus policy can query `useRootSettings`.
A nested theme boundary may override appearance without creating a separate
input-modality tracker. Component test scenes use the shared themed renderer.
