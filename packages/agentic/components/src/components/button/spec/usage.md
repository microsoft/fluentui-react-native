# Button usage

Use Button for a one-time action. Use ToggleButton for persistent on/off
state and MenuButton for a menu of commands. Use `primary` for the highest
emphasis action, `secondary` (the default) for ordinary actions, `outline`
for lighter containment and `subtle` for low emphasis.

```tsx
<Button appearance="primary" content="Save" onPress={save} />
<Button content="Next" leadingIcon={documentIcon} trailingIcon={nextIcon} onPress={next} />
<Button accessibilityLabel="Close dialog" leadingIcon={closeIcon} shape="circular" onPress={close} />
```

Rounded is the default even without a label. Both icon slots are optional
with a label; an icon-only button renders only its leading icon. Render inside
`ThemedRoot` so the platform focus policy can read the scene's input modality.

Replace the old `icon` and `iconPosition` combination with the desired slot.
An old `shape="circle"` becomes `shape="circular"`; there is no square shape.
See the [ToggleButton migration guide](../../toggle-button/spec/usage.md) before
replacing `selected`, including on callers that formerly used non-Subtle styling.
