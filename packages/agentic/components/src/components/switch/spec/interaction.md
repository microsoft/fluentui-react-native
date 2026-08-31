# Switch interaction

## Pointer

The whole hit area is pressable, including the padding around the track, and it
is sized to a comfortable minimum height and width that is larger than the track
itself. Labels sit outside the hit area: pressing the text does not toggle the
switch.

A press toggles first and then forwards the caller's `onPress`, so a handler
that reads state from a callback argument or from a subsequent render sees the
new value. Hover changes the track and thumb colors; pressed does the same at
its own precedence step, above hover.

While `disabled`, the underlying pressable stops reporting presses, the toggle
is refused even if a press were delivered, and the disabled colors apply to the
track, the thumb, and any rendered label.

## Keyboard

Tab moves focus to the hit area while it is enabled. The component recognizes
Enter, Space, and the platform spellings of the space key on key up. It also
registers the normal `Pressable` action handler. If a native platform
synthesizes that action for the same key, both paths request a toggle; this
event sequence remains a documented verification gap.

The caller's key handler runs before the explicit key-up toggle, so a caller can
observe the key first. Nothing else is bound; the switch does not respond to
arrow keys, and moving through a group of switches is plain tab order.

## Focus visual

A two-ring focus visual is drawn inside the hit area, following the root corner
radius, whenever the root is focused and is not disabled. The two rings resolve
from the inner and outer focus stroke tokens, so the indicator remains visible
regardless of the surface behind it.

React Native does not report focus modality on these platforms, so the ring
appears for pointer focus as well as keyboard focus.

## State transition

Changing the checked value animates a single progress value from zero to one, or
back, over 150 milliseconds with an ease-in-out curve. That one value drives all
three visual changes together: the thumb slides across the track, the track
background and border crossfade, and the thumb color crossfades. Because colors
are interpolated, the transition runs on the JavaScript driver rather than the
native driver.

The thumb travels exactly the track width minus the two track borders, the two
inset offsets, and the thumb width, so it lands flush against the inside of the
track at both ends and never clips.

The animation is skipped on first mount, so a switch that renders already
checked appears in its end state rather than sliding into it. It is also skipped
while the platform reduced-motion setting is on: the progress value is set
directly to the end value, which keeps the colors and the position correct with
no travel.

## Externally driven switches

When the caller supplies `checked`, the interaction still reports through
`onChange` and `onPress`, but the rendered value does not move until the caller
passes a new `checked`. A caller that ignores `onChange` therefore gets a switch
that visibly refuses to change, which is a bug in the caller rather than in the
component. Only omit `checked` when the switch is free to own its own value.
