# DestructiveButton interaction

## State model

`usePressableState` derives hover, press, and focus from the root `Pressable`.
Token resolution applies appearance first, then interaction state. Disabled
values override interactive presentation, pressed overrides hovered, and the
user root style is the final style layer.

The component forwards native action and interaction handlers. It does not trap
focus, implement arrow-key navigation, or move focus after activation.

## Activation

Native button behavior handles keyboard and pointer activation on Windows and
macOS. A disabled button neither focuses nor invokes its action.
DestructiveButton is a single focusable element rather than part of a composite
widget, so it adds no arrow-key model.

Activation fires the caller's action once. The component has no selection axis
and holds no state across activations, so there is no controlled or
uncontrolled value to reconcile and no label-width reservation to keep the
layout stable.

When activation opens a confirmation surface, that surface owns initial focus,
focus containment, and focus return.

## Danger feedback

The primary appearance moves within the danger loud family across rest,
hovered, and pressed. The subtle appearance is transparent at rest and reveals
a danger tint on hover and press, resolved from the danger subtle token rather
than from its transparent rest value, so the interaction still reads as
dangerous rather than neutral.

The danger loud interaction values have no FURN theme mapping today, so the
primary appearance currently resolves one background across rest, hover, and
press. That is a recorded token gap rather than a contract decision; the
component already asks for the interaction values and will pick them up when
the theme supplies them. See `spec/tokens.yaml`.

Neither appearance draws a stroke in any state.

## Focus and motion

The focus visual stays in the tree for the lifetime of the button. Focus
changes its visibility rather than adding or removing border-bearing native
views. It is hidden while disabled.

DestructiveButton performs no timed state animation. Appearance, interaction,
and focus styles update immediately, so reduced-motion handling adds no
separate branch.
