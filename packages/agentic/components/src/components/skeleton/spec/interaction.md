# Skeleton interaction

## Pointer and keyboard

Skeleton is not a `Pressable`, exposes no press, hover, or focus handlers, and
holds no interaction state. The root is not focusable by default, but a caller
can opt it into focus through forwarded `ViewProps`. The root and highlight
overlay default to `pointerEvents="none"`, so a placeholder layered over an
interactive surface does not intercept input. An explicit root override is
preserved.

## Measurement

The component tracks the root rectangle from `onLayout`. A caller-supplied
`onLayout` runs first and the measured rectangle is recorded afterwards, so
forwarding a layout handler never disables the sweep.

The sweep is gated on measurement: it starts only once the measured width and
height are both greater than zero, and it restarts when either changes. A
placeholder with no measured size renders as a static themed block.

## Sweep

The sweep is a highlight band that travels across the placeholder on a
continuous linear loop. The band is a fraction of the measured width with a
fixed minimum, and it translates from just before the leading edge to just past
the trailing edge, so the band is fully off the placeholder at both ends of a
cycle. The loop repeats without pausing for as long as the placeholder is
mounted.

The animation runs through `Animated` with the native driver, so it is not
affected by JavaScript thread work. Active placeholders subscribe to one shared
sweep channel, so instances mounted at different times read the same phase.

## Motion and lifecycle

While the platform reduced-motion setting is on, the loop is stopped, the clock
is reset, and the highlight overlay is not rendered. Turning the setting off
restarts the loop from the beginning. No alternative motion is substituted.

There is no enter or exit animation. Mounting a placeholder shows it
immediately, and swapping it for real content is an instant replacement. The
shared loop stops and resets when its last active subscriber leaves.
