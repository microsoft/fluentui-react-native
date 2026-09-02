# DestructiveButton accessibility

## Native semantics

The root is one accessible React Native element with `role="button"`. Danger is
carried by color and by the label, never by a distinct role.
`accessibilityState.disabled` always reflects `disabled`. Other caller-provided
accessibility state, such as `busy`, is preserved.

DestructiveButton has no selection axis, so the root never reports checked or
pressed state. A destructive command fires once and returns to rest.

The root defaults to `accessible={true}` and is focusable unless disabled.
Callers may provide an accessible name through `accessibilityLabel` or
`accessibilityLabelledBy`, and may point at supporting text with
`accessibilityDescribedBy` when the consequence needs more context than the
label carries.

## Naming and icon-only buttons

The visible label must be contained in the accessible name so voice control can
target what a person reads. Keep destructive labels short and specific: a
truncated verb can hide the real consequence.

An icon-only button must provide a concise label that describes the action,
such as "Delete item" rather than the icon's visual name. Development builds
warn when neither supported naming prop is present. Product UI should also
provide visible context, commonly a tooltip, for people who do not recognize
the icon.

The icon slot is a decorative child of the named root and sets
`accessible={false}`. Do not give it a second announced label.

## Contrast and target size

Label and icon colors meet at least 4.5 to 1 against their resolved background
in every enabled state, for the primary danger fill and for the subtle
foreground over both its transparent rest background and its hovered tint. The
primary fill boundary and the focus rings meet at least 3 to 1 against adjacent
colors. Disabled colors are intentionally lower contrast but stay legible at no
less than 2 to 1.

The root keeps a minimum 24 by 24 layout. Small icon-only buttons sit at that
boundary, so surrounding interactive elements must not encroach on them.

## State and focus

Disabled buttons communicate unavailable state, do not activate, and are
removed from keyboard focus. Do not use disabled to hide the reason an action
is blocked; explain it nearby instead.

The visible focus indicator is the persistent shared `FocusVisual`, which draws
inner and outer rings from focus stroke tokens. The native Windows focus ring
is disabled to prevent a competing or unstable focus border.

## Error prevention

Color signals severity but does not prevent accidental activation. An action
that destroys data the person controls should be confirmed or reversible. When
activation opens a confirmation surface, that surface owns its own
announcement, initial focus, and focus return.
