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

The sweep is a three-stop linear gradient: transparent at both ends and the
themed highlight at the center, with peak opacity 0.64. It travels left to right
in LTR and right to left in RTL, with a fixed diagonal 45-degree band. The
horizontal band width is 45 percent of the measured root width, rounded to a
whole layout unit, with a minimum of 24.

The gradient uses user-space coordinates rather than a stretched bounding-box
gradient. Its viewport width is the band width plus the root height, which
contains the complete diagonal at every row without hard side cuts. Translation
runs between minus that viewport width and the root width, reversed in RTL, so
the highlight is fully outside the clipped root at both ends of the loop.
Resizing recomputes the geometry without creating a separate animation clock.

The animation runs through the shared `Animated` loop. It uses the native
driver except on macOS Fabric, whose native transform updates remain static;
that renderer uses the JavaScript driver. Active placeholders subscribe to one
shared sweep channel, so instances mounted at different times read the same
phase.

An opaque highlight color, such as a native high-contrast `PlatformColor`,
cannot be passed to SVG gradient stops. In that case no loop starts and the
placeholder remains static with a token-colored outline. Development builds warn about this renderer
limitation instead of silently substituting a solid moving band.

## Motion and lifecycle

While the platform reduced-motion setting is on, the loop is stopped, the clock
is reset, and the highlight overlay is not rendered. Turning the setting off
restarts the loop from the beginning. No alternative motion is substituted.

There is no enter or exit animation. Mounting a placeholder shows it
immediately, and swapping it for real content is an instant replacement. The
shared loop stops and resets when its last active subscriber leaves.
