# Spinner interaction

## Input

Spinner has no interactive states. There is no hover, press, focus, selected, or
disabled treatment, and no callback of any kind. The root defaults to
`pointerEvents="none"`, so pointer input passes through to whatever sits behind
it and the spinner cannot swallow a click on a covered control. A caller that
deliberately wants the indicator to absorb pointer input can override
`pointerEvents`, but the root still stays out of the keyboard tab order because
it is never focusable.

## Rotation

The drawing surface rotates a full turn on a continuous loop: `Animated.timing`
over 1500 milliseconds with linear easing, wrapped in `Animated.loop` and run on
the native driver so the rotation is unaffected by work on the JavaScript
thread. The rotated value is interpolated from zero to a full turn, so the
wrap-around from the end of one cycle to the start of the next is seamless and
there is no pause at the top.

Only the surface rotates. The track is a full circle and is visually unchanged
by the rotation; the indicator is a quarter-circumference arc, so the apparent
motion is the arc sweeping around a static ring. The arc keeps that same
proportion at every size because the dash pattern is expressed against a
normalized path length rather than in absolute units.

## Reduced motion

The platform reduced-motion setting is read asynchronously and is tri-state
while it resolves: unknown, on, or off. The loop starts only once the setting is
known to be off. While it is unknown the arc is drawn static, which means the
first frames of a fresh mount never animate ahead of the check. When the setting
turns on, the loop stops and the rotated value resets to its starting angle, so
the arc lands in a stable position rather than freezing wherever it happened to
be.

Nothing else responds to reduced motion. The spinner does not swap in a
different visual, slow down, or pulse; it simply stops moving while still
reporting that work is in progress.

## Timing and lifecycle

Each spinner runs its own clock, starting when it mounts. Several spinners
rendered at the same time are therefore not guaranteed to be in phase. Prefer a
single spinner for a region over one spinner per row.

Do not mount a spinner for work that usually completes in a frame or two: a
spinner that appears and disappears immediately reads as a flicker. Do not swap
sizes or remount the spinner mid-load, because remounting restarts the rotation
from its starting angle.
