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

Tab moves focus to the hit area while enabled. Switch changes value only through
its press action or the native `Toggle` accessibility action. It does not add a
second key-up toggle. The shared focusable-pressable helper preserves native
activation and adds a paired Win32 fallback only for otherwise-unrecognized
native key codes. Caller key/accessibility handlers remain forwarded.

Enter/Space activate on the renderer's phase: key-up on Windows/Win32 and
key-down on macOS. The switch does not claim arrow navigation.

## Focus visual

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.

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

## Focus target lifetime

The state hook uses the shared ref-backed focus foundation. Internal focus-target
refs compose with caller refs on the actual interactive slot, without redirecting
structural root refs. Native self-focus is distinct from descendant events, and
detach/disable invalidates pending focus requests. Focus visuals observe root
modality only while focused on the custom path; there is no scene-wide rerender.
