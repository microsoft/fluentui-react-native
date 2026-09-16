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

The root resolves the semantic toggle through Framework Base:
`toggle` on Windows Fabric, `Toggle` on Win32, and the existing `Toggle`
custom action on macOS. Both declaration and event comparison use that resolved
name. Caller spellings of the owned action are normalized, duplicate names are
removed, and caller order and the first supplied label are retained.

Toggle activation respects disabled and controlled status and forwards the
original caller `onAccessibilityAction` exactly once without synthesizing a
press. Custom and disabled actions are still forwarded. A standalone `activate`
event is not an additional toggle path.

The [shared action foundation](../../../../../../framework-base/src/accessibility/AGENTS.md)
records RNW 0.81.35, Win32 0.81.8, and RNmacOS 0.81.9 source evidence.
macOS Fabric custom actions emit the declared name verbatim and ignore the
display label; this does not establish default AXPress support. Native
qualification must invoke UIA Toggle or the AX custom action and check state
plus callback counts, not merely read a checkmark after a physical click.

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

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.

The custom dual-ring visual surrounds the whole row, including the label column.
