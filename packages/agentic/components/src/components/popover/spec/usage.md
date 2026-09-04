# Popover usage

## What Popover is for

Reach for Popover when a control should reveal extra content next to itself without navigating away and without taking over the screen. The content is a normal composition — text, controls, or a small form — and the person can dismiss it by interacting outside it.

## What the desktop surface implies

Popover's surface is a platform popup window, not a view inside the app's layout. Three consequences shape every decision about it.

The surface lives outside the app's normal focus order. Focus movement into the popup is decided by the platform and differs between Windows and macOS, and nothing returns focus to the trigger when the surface goes away. A flow that depends on where focus lands afterwards must control `open` and place focus itself.

The surface can be dismissed at any time and the dismissal cannot be blocked. Treat every open surface as something that may disappear on the next outside interaction. Do not place the only path to a required action inside one, and do not rely on it to confirm a destructive operation — a modal surface is the right tool for that.

The surface is positioned by the platform. `position` states a preference, and the result can differ per platform and can be adjusted when the surface would not fit. Do not build a layout that only reads correctly at one exact placement.

## Choosing between components

Use a tooltip when the content is a short, non-interactive description of the control itself. A tooltip appears on hover or focus and disappears on its own; a popover requires a deliberate activation and stays until it is dismissed.

Use a menu when the content is a list of actions or options and the person is expected to pick one. A menu owns keyboard traversal and selection semantics that Popover deliberately does not provide.

Use a dialog when the person must resolve something before continuing. A dialog is modal and cannot be dismissed by an incidental outside interaction; a popover can.

## Writing the trigger

The `trigger` slot supplies presentation only: children, style, a test identifier, an accessible name, and an optional `onPress` that runs after the toggle. Popover owns role, expanded state, activation, disabled state, and focusability, so the slot type does not accept them.

Give the trigger a name that describes what the surface reveals, not the mechanics of opening it.

## Naming the surface

`surfaceAccessibilityLabel` names the floating surface and is required. It is separate from the trigger's name so that one label cannot silently apply to the wrong element. Popover warns in development when it is missing.

## Content

The `content` slot takes any React Native composition. Omit it while prototyping to get a placeholder, or pass `null` for an empty surface.

Keep the content self-contained. Do not nest one Popover's surface inside another's content: each surface is its own popup window with its own dismissal, and the resulting lifetimes are not coordinated by this component.

## Example

```tsx
import { Popover, Text } from '@fluentui-react-native/components';

<Popover
  surfaceAccessibilityLabel="Sync details"
  trigger={{ accessibilityLabel: 'Sync details', children: <Text>Details</Text> }}
  content={{ children: <Text>Last synced 5 minutes ago.</Text> }}
/>;
```

Drive `open` yourself when something other than the trigger has to change the state:

```tsx
const [open, setOpen] = React.useState(false);

<Popover
  open={open}
  onOpenChange={setOpen}
  position="topLeftEdge"
  surfaceAccessibilityLabel="Filter options"
  trigger={{ accessibilityLabel: 'Filter options', children: <Text>Filter</Text> }}
  content={{ children: <FilterForm onDone={() => setOpen(false)} /> }}
/>;
```
