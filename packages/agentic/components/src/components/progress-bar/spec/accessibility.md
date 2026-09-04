# ProgressBar accessibility

## Native semantics

The root is a `View` with `role="progressbar"` and defaults to
`accessible={true}`. The header, the label, the trailing group, the value text,
the validation icon, the track, and the indicator are all non-accessible, so the
bar is announced once from the root.

On Windows, UI Automation reports a progress control with a name and, for a
measured bar, a range value. On macOS, VoiceOver announces a progress indicator
with its name and value.

## Naming

The label text is always rendered and always carries a generated identifier. The
root references that identifier through `accessibilityLabelledBy`, so the
accessible name comes from visible text in every case. A caller value for
`accessibilityLabelledBy` is preserved and the generated identifier is appended,
so extra description nodes can be referenced without losing the name.

Because the name comes from the visible label, replace the default label text
with something that identifies the task. `Label` names nothing.

## Value

| Type            | Reported value                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `determinate`   | A bounded value with minimum `0`, maximum `100`, and the resolved percentage as the current value. |
| `static`        | The same bounded value as determinate.                                                             |
| `indeterminate` | No value at all. The absence of a value is what marks the progress as unmeasured.                  |

A text form of the value is published only when the resolved value text differs
from the plain percentage, so a contextual phrase such as a byte count or a file
count is announced instead of the bare number, while a plain percentage is not
duplicated.

An indeterminate bar also reports a busy state. That state is what carries the
work-in-flight meaning when reduced motion has removed the visual loop, so an
indeterminate bar remains meaningful to assistive technology with no animation
running.

## Status

ProgressBar does not announce a change from neutral to error or success. React
Native exposes no live-region facility here, and the progress role is not a
delivery mechanism for outcome messages. Announce outcomes from the surrounding
surface, for example a status message rendered next to the bar, and do not
duplicate the same message in two places.

The validation icon is hidden from the accessibility tree, so status must also
be carried by the value text or the label. Color alone is not sufficient.

## Update frequency

Value changes are published on every render. Updating many times per second
produces an announcement storm on both platforms. Throttle updates to roughly
one step every ten percent, or to no more than one update every half second.

## Focus

ProgressBar sets `focusable={false}` on the root and attaches no focus handlers,
so it never enters the tab order and has no focus indicator. Any cancel or retry
affordance must be a separate focusable control.
