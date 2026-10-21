# Popover usage

Use Popover for supplementary, structured content anchored to a trigger:
details, a short form, or a few related actions that a person can dismiss at
any time. Use Tooltip for a single line of plain text, Dialog when the person
must decide before continuing, and Menu for a list of commands.

```tsx
<Popover trigger={{ content: 'Sharing' }} surface={{ accessibilityLabel: 'Sharing settings' }}>
  <Text>Anyone with the link can view.</Text>
  <Button content="Copy link" onPress={copyLink} />
</Popover>
```

Close the popup from content by controlling it:

```tsx
const [open, setOpen] = React.useState(false);

<Popover open={open} onOpenChange={setOpen} trigger={{ content: 'Rename' }} surface={{ accessibilityLabel: 'Rename file' }}>
  <Input defaultValue={name} onChangeText={setName} />
  <Button content="Save" onPress={() => setOpen(false)} />
</Popover>;
```

Always name the surface with `accessibilityLabel`. Give an icon-only trigger an
action-oriented `accessibilityLabel`, as Button requires.

Do not put required or critical information in a Popover, and do not nest a
Popover inside another Popover's content. Popover does not block the rest of
the window, trap focus, or require an explicit close control; Escape and
pointer input outside the popup always dismiss it.

`onOpenChange` reports trigger toggles and native dismissal. A controlled
caller that keeps `open` true after a dismissal leaves the popup closed until
it sets `open` to false and back to true or the trigger is pressed again.

## Scene root

Render the scene inside `ThemedRoot`. The surface reuses the scene's input
modality through a private boundary so focus visuals inside the popup match
the rest of the window.

## Availability

Popover runs on macOS and Windows through native-core's modern Callout, and on
Office Win32 through native-core's Win32 Callout adapter. On Win32 the popup
sits flush against the trigger.
