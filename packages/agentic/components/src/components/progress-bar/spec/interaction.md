# ProgressBar interaction

## State model

ProgressBar tracks no interaction state. It attaches no press, hover, or focus
handlers and exposes no hover or pressed token bindings. Its rendered output
depends on `type`, `status`, the resolved value, the two visibility flags, the
measured track width, the reduced-motion setting, and the active theme.

The caller `style` is the final layer applied to the root, after the
token-derived root style.

## Keyboard and pointer

ProgressBar is not focusable and is not a tab stop on Windows or macOS. It has
no focus visual. Pointer events over the header or the track produce no visual
change and no callbacks. A cancel, pause, or retry control must be a separate
focusable element next to the bar.

## Measurement

The track reports its width on layout, and the indicator width is computed from
that number rather than from a percentage-based layout. Before the first layout
pass the width is zero, so the bar renders empty for one frame. A track that is
never laid out, for example inside a collapsed container, keeps an empty
indicator.

For determinate and static the indicator width is the resolved percentage of the
measured width. For indeterminate it is a fixed segment: roughly a third of the
track, with a small floor so a narrow track still shows a visible segment.

## Value behavior

The value is clamped to the range `0` through `100`, and a missing or non-numeric
value resolves to `0`.

Determinate and static bars use the clamped incoming value directly, so they
move forward or backward as the reported percentage changes. Switching from an
indeterminate bar to a measured bar snaps directly to the calculated value
rather than easing from the looping segment.

## Motion

An indeterminate bar translates its fixed segment across the track on a
two-second linear loop that restarts from the leading edge. The loop runs only
when the type is indeterminate, reduced motion is off, and the track has a
measured width; otherwise it is stopped and the offset is reset so the segment
rests at the leading edge.

Determinate value changes apply immediately. The intent to ease the width over
two hundred milliseconds is expressed with web-only style keys that the Windows
and macOS renderers ignore, so a determinate change and a static change look the
same in practice.

With reduced motion enabled the loop does not run and the segment stays at rest,
while the busy state continues to carry the work-in-flight meaning to assistive
technology.

## Long-running work

An indeterminate bar that runs for more than a few seconds reads as stuck.
Surface an estimate or a cancel control in the surrounding layout, and switch to
determinate as soon as a percentage becomes available.
