# Divider accessibility

## Native semantics

The root is a `View` with `accessibilityRole="separator"` and defaults to
`accessible={true}`. The role is owned by the component and is not part of the
public root prop surface.

On Windows, UI Automation reports the element as a separator. On macOS,
VoiceOver announces it as a splitter or separator with its name. Neither
platform exposes an orientation value for a separator, so a vertical Divider is
announced exactly like a horizontal one; convey column or panel structure
through the surrounding layout and headings instead.

## Naming

The accessible name is `accessibilityLabel` when supplied, and otherwise the
label text resolved from the `label` slot. Shorthand children and a `children`
entry in a props object are both read for this fallback, so a labeled Divider
announces the section boundary it introduces without extra wiring.

A Divider with `label={null}` and no `accessibilityLabel` has no name and
announces only its role.

The icon and the label are marked `accessible={false}`, and the content
container is as well, so the separator is announced once from the root rather
than as several nested elements.

## Decorative dividers

When the separation is already carried by headings or grouping, pass
`accessible={false}` on the root to keep the separator out of the accessibility
tree. Prefer that over removing the label, because the label is what gives an
announced separator its meaning.

## Focus

Divider sets `focusable={false}` on the root and attaches no focus handlers, so
it never enters the tab order and has no focus indicator. `focusable` is not
part of the public root prop surface, so this cannot be overridden.
