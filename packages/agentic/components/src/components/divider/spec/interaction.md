# Divider interaction

## State model

Divider has no interaction state. It attaches no press, hover, or focus
handlers, tracks nothing across renders, and exposes no hover or pressed token
bindings. Its rendered output depends only on `layout`, `vertical`, the two
content slots, and the active theme.

The caller `style` is the final layer applied to the root, after the
token-derived root styles.

## Keyboard and pointer

Divider is not focusable and is not a tab stop on Windows or macOS. It has no
focus visual. Pointer events over the line and the content produce no visual
change and no callbacks.

## Layout behavior

The root stretches along its parent's primary axis and centers its children on
the cross axis, so the line passes through the middle of the content rather
than along one edge.

For `layout="center"` both line segments grow equally and the content sits at
the midpoint. For `layout="start"` the leading line becomes a fixed stub and
the trailing line takes the remaining space; `layout="end"` is the mirror
image. Writing direction determines which end reads as the start.

A horizontal Divider fixes the line's height and lets its width grow, and pads
the content on the horizontal axis. A vertical Divider fixes the line's width
and lets its height grow, and pads the content on the vertical axis. The icon
and label lay out horizontally in both orientations; no rotation or vertical
writing mode is applied.

A constrained root shrinks the content container and wraps the label rather
than clipping it or collapsing the lines.

## Motion

Divider runs no animation and holds no timers, so reduced-motion settings need
no separate path.
