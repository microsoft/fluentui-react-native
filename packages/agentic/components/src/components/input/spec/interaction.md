# Input interaction

## State model

Input observes native self-focus through `useFocusTarget`, tracks hover and press
locally, and reduces them, together
with `disabled`, `error`, and `readOnly`, to exactly one visual state per
render. The precedence is disabled, error, read only, focused, pressed,
hovered, rest. Only that one state contributes styling, so an errored field
that is also hovered keeps the error boundary.

When `disabled` becomes true the component clears focus, hover, and press, so a
field that is disabled while the pointer is over it or while it holds focus does
not keep stale interaction styling.

The caller `style` is the final layer applied to the root, after the
token-derived root styles.

## Pointer

Hover and press handlers are attached to the text input, together with any
caller handlers and any handlers set on the `textInput` slot; all of them run.
Because the tracking lives on the text input rather than the container, the
horizontal padding and the icon areas are not hover targets, so moving the
pointer from the text into the padding drops the hovered state.

Hover recolors the boundary to the hovered neutral stroke and press recolors it
to the pressed neutral stroke. Neither changes the layout, so the field does not
shift under the pointer. Both are suppressed while disabled.

The contents row forwards pointer activation in the external spacing and icon
regions to the native editor, without adding a focus stop or another announced
control. This keeps the field easy to activate after moving vertical spacing
outside the editor. Activation requests focus with pointer intent through the
shared focus target and respects its resolved `focusable` eligibility. Disabled
fields ignore that activation; read-only fields retain focus and copy behavior
by default. Native editing, selection, and caller slot refs remain owned by the
TextInput.

## Keyboard

The platform text input owns caret movement, selection, text composition,
clipboard shortcuts, and character entry. Input adds no key handling and does
not intercept Tab, so the platform tab order is unchanged and the field is
exited with Tab on both Windows and macOS.

A disabled or read-only field is not editable: the text input receives
`editable={false}`, so no keystroke changes the value. A disabled field is also
removed from the tab order by the default `focusable` resolution, while a
read-only field remains reachable so its value can be read and copied.

Focus recolors the boundary to the heavy neutral stroke at the rest thickness.
There is no separate focus ring, so the focused field is distinguished by color
rather than by an added visual.

## Value

The value is controllable. Supplying `value` drives it externally; otherwise the
component keeps it internally starting from `defaultValue`, or from the empty
string when neither is given. `onChangeText` runs on every text change, so an
externally driven field must write the next value back for the text to persist.
While disabled or read only the internally driven value is never updated.

## Icons

`iconStart` renders inside the text stack before the text input. `iconEnd1` and
`iconEnd2` render in a trailing group that is laid out after the text stack, so
the text shrinks before the icons do. `iconEnd2` renders only alongside
`iconEnd1`; supplying it alone renders nothing and logs a development warning.

Icons are decorative. They receive no press handling from Input, so an icon that
needs to be actionable must be a separate control rendered next to the field.

## Motion

Input runs no animation and holds no timers, so state changes are immediate and
reduced-motion settings need no separate path.

## Focus target lifetime

The state hook uses the shared ref-backed focus foundation. Its internal ref
composes with the caller's `textInput.ref`; the public root ref remains on the
structural View. Native self-focus is distinct from descendant events, and
detach/disable invalidates pending focus requests. The target and native slot
share the resolved `focusable` value: direct textInput props override the root
setting, but disabled always wins. Input retains its border-only focus styling;
it does not subscribe to root modality or mount a custom focus ring.

## Native focus qualification

The `FocusManagement` WDIO case verifies native text editing and caret movement,
then checks that Tab skips the disabled field and focuses the following button.
The disabled field must remain natively unfocused. Win32's native editor was
observed reporting UIA `IsEnabled=true` despite `editable=false`,
`focusable=false`, and disabled accessibility state. That enabled-state
announcement gap is not treated as evidence of focusability or hidden by an
assumed native disabled value.
