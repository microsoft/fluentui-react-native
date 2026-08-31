# Checkbox accessibility

## Native semantics

The root is a single accessible React Native element with
`accessibilityRole="checkbox"`. It defaults to `accessible={true}` and is
focusable unless disabled.

`accessibilityState.checked` carries the status directly: `false` for
`unchecked`, `true` for `checked`, and `'mixed'` for `indeterminate`.
`accessibilityState.disabled` always reflects `disabled`. Any other caller
accessibility state, such as `busy`, is merged and preserved; the checked and
disabled entries are owned by the component.

On Windows, UI Automation reports the control as a check box and maps the
three-valued checked state to its toggle state, so an indeterminate parent
announces as mixed rather than as a third unnamed value. On macOS, VoiceOver
announces the name, the check box role, and the checked, unchecked, or mixed
value.

## Naming and description

The accessible name is `accessibilityLabel` when supplied and the `label`
string otherwise. Hiding the visible label with `showLabel={false}` therefore
never removes the name; it falls back to `label`. Supply an explicit
`accessibilityLabel` whenever the visible label text would not read as a
complete option on its own.

When secondary text renders, it is appended to the root `accessibilityHint`
after any caller-supplied hint, joined with a period and a space. Screen
readers announce it after the name and state rather than folding it into the
name.

The label, secondary text, and indicator are marked `accessible={false}` and
the secondary text additionally sets `accessibilityElementsHidden`, so the row
is announced once from the root instead of as several sibling elements.

## State and focus

A disabled Checkbox reports disabled state, sets `focusable={false}`, and does
not respond to activation. It is skipped by keyboard navigation rather than
announced as an unavailable stop.

The visible focus indicator is a persistent dual-ring overlay drawn from the
focus stroke tokens. It stays mounted and toggles visibility, and it is hidden
while disabled or while focus came from a pointer press. Keyboard and
programmatic focus show it. It surrounds the whole row, including the label
column, so the indicated region matches the press target. The overlay is hidden
from the accessibility tree and does not receive pointer events.

Checkbox disables the react-native-windows platform focus visual so the shared
dual-ring overlay is the single visible focus treatment.
