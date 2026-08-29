# Checkbox interaction

## State model

Hover, press, and focus are derived from the root `Pressable` through the
shared pressable-state hook. Color resolution reads the status first, then
disabled, pressed, and hovered in that order. Hover and press values come from
the hover and pressed sub-palettes of the same semantic color the status
already selected, so an unchecked indicator shifts within its neutral stroke
and a checked indicator shifts within its brand fill.

The caller `style` is the final layer applied to the root, after all
token-derived styles.

## Activation and status

The entire row is one press target: the indicator, the gap, the label, and the
secondary text all activate the same control. Space activation comes from the
native pressable button behavior on Windows and macOS; Checkbox adds no key
handling and does not intercept Tab.

A press resolves the next status from the current one. `checked` resolves to
`unchecked`. Both `unchecked` and `indeterminate` resolve to `checked`, so a
mixed parent moves forward to fully selected rather than cycling back through
mixed. `onStatusChange` receives the resolved value and any caller `onPress`
handler runs afterward.

Status ownership follows the supplied props. While `status` is supplied the
control is externally driven: it renders exactly what it is given, reports the
resolved value, and does not move on its own. Without `status` it starts from
`defaultStatus` and applies the resolved value itself while still reporting it.

A disabled Checkbox returns from the press handler before resolving a status,
so neither `onStatusChange` nor the caller `onPress` runs.

## Focus and motion

The focus visual stays in the tree for the lifetime of the control. Focus
changes its visibility rather than mounting or unmounting a border-bearing
native view. It is shown only when the control is focused and enabled.

Focus is tracked from focus and blur events without distinguishing input
modality, so a pointer press that moves focus also shows the ring.

Checkbox runs no timed animation. Status, hover, press, and focus styling
change on the next render, so reduced-motion settings need no separate path.
