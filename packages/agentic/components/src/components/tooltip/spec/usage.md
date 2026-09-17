# Tooltip usage

## What Tooltip is for

Reach for Tooltip when a control needs a short description that appears while the pointer or keyboard focus rests on it. The description is a single line of text, it is never interactive, and it goes away on its own.

Tooltip is a specialization of Popover. It reuses the same anchored surface and the same trigger pipeline, and replaces the decisions a tooltip must own: the label appears on hover and focus instead of on activation, focus stays where it was, the trigger reports no expanded state, and the surface is a label rather than a container.

## What the desktop surface implies

The label surface is a platform popup window, not a view inside the app's layout, and the same three consequences that shape Popover apply here.

The surface is positioned by the platform. `position` states a preference. On Windows the full set of preferred edges resolves; on macOS every preference on one side collapses onto that screen edge, so a macOS tooltip is edge-aligned rather than centered on its trigger. Do not write a label that only reads correctly at one exact placement.

The surface can be taken away at any time and that cannot be blocked. Tooltip adopts every close request, so never put information in a tooltip that the person must be able to read again on demand.

Focus behavior differs by platform. macOS keeps focus on the trigger while the tooltip is shown. The Windows popup takes focus whenever it is shown, so a Windows tooltip revealed by keyboard focus moves focus off the trigger and is then hidden again by the resulting blur. Treat keyboard-revealed tooltips as dependable on macOS only, and never make a tooltip the only place a piece of information appears.

## Choosing between components

Use Popover when the content is a composition the person interacts with, or when it should stay until it is deliberately dismissed. Popover opens on activation and keeps a container; Tooltip appears on hover or focus and keeps a label.

Use a persistent label, a helper text, or a field description when the information matters to every person on every pass. A tooltip is supplementary: touch users may never see it, and this component does not add a touch affordance.

## Writing the label

`content` is required and must resolve to a string, because the same text describes the trigger and names the surface. Keep it to a short phrase that says what the control does, not how the tooltip works, and do not repeat the trigger's own accessible name verbatim — a screen reader announces the name and then the description.

Pass a string for the common case, or `Text` slot properties when the label needs its own style or test identifier. Interactive content is not supported: the surface is a separate popup window and nothing inside it can be reached.

## Writing the trigger

The `trigger` slot supplies presentation only: children, style, a test identifier, an accessible name, an ARIA-aligned `role` when the trigger is not a button, a `ref`, and pointer, focus, and press handlers that run after Tooltip's own handling. Tooltip owns the description, the accessibility state, the accessible and focusable flags, the disabled state, and the native focus ring, so the slot type does not accept them.

Trigger activation never reveals the tooltip; it hides it. The trigger's own `onPress` still runs, so wrapping a real control keeps that control's action intact.

## Timing and disabled triggers

`showDelay` applies only to the pointer path and defaults to 300 milliseconds. Focus reveals the label immediately. `hideDelay` defaults to 0 milliseconds. Raise `showDelay` in a dense layout so labels do not flash while the pointer crosses the region, and raise `hideDelay` only when the pointer has to travel between adjacent triggers.

`disabled` stops the trigger from revealing the label and reports disabled trigger semantics, but it never hides a tooltip that is already shown and never blocks a dismissal.

## Example

```tsx
import { Text, Tooltip } from '@fluentui-react-native/components';

<Tooltip
  content="Refresh the list from the server"
  trigger={{ accessibilityLabel: 'Refresh', children: <Text>Refresh</Text>, onPress: refresh }}
/>;
```

Drive `visible` yourself when something other than the trigger decides when the label is shown:

```tsx
const [visible, setVisible] = React.useState(false);

<Tooltip
  content={{ children: 'Sync is paused while offline' }}
  onVisibleChange={setVisible}
  position="bottomCenter"
  showDelay={600}
  visible={visible}
  trigger={{ accessibilityLabel: 'Sync status', children: <Text>Paused</Text> }}
/>;
```
