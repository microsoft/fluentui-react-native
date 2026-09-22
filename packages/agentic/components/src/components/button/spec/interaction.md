# Button interaction

## State model

`useFocusablePressable` derives hover and press and observes native self-focus
on the root `Pressable`. Token resolution uses appearance first, then selected and
interaction state. Disabled values override interactive presentation. User
root style is the final style layer.

The component forwards native action and interaction handlers. It does not
trap focus, implement arrow-key navigation, or move focus after activation.

## Activation and selection

Native button behavior handles keyboard and pointer activation on Windows and
macOS. A disabled button neither focuses nor invokes its action.

Button never changes `selected` in response to activation. A caller that uses
toggle presentation updates its own state from `onPress`. Supplying
`selected={false}` is meaningful: it enables checked-state semantics and the
layout-stable label path while rendering the unselected visuals.

When selected, `selectedIcon` replaces `icon`; if `selectedIcon` is absent,
the normal icon remains. Selected text renders semibold over a hidden
semibold reservation so changing the visible weight does not resize the
button.

## Focus and motion

Disabled buttons do not display focus feedback.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.

Button currently performs no timed state animation. Hover, press, selection,
and focus styles update immediately, so reduced-motion handling adds no
separate branch.

## Focus target lifetime

The state hook uses the shared ref-backed focus foundation. Internal focus-target
refs compose with caller refs on the actual interactive slot, without redirecting
structural root refs. Native self-focus is distinct from descendant events, and
detach/disable invalidates pending focus requests. Focus visuals observe root
modality only while focused on the custom path; there is no scene-wide rerender.

## Executable focus coverage

Named WDIO cases in `FocusManagement` verify native pointer focus, exactly-once
activation, key pairing across blur, repeated key-down, disabled Tab stops, and
shared nested-root modality without refocusing the same target. `FocusRequests`
verifies native confirmation and rejects disabled/detached targets without
rewriting physical modality. Each case starts with a fresh story and session.

These cases run on Windows, Win32, and macOS. Only the ordinary click-focus
assertion is Windows-specific; keyboard setup uses an editable entry followed by
Tab. macOS activates Return/Space on keydown, while Windows/Win32 activate on
keyup. Releasing a key or cancelling a started press clears pressed feedback
without another activation, including after an intervening key or self-blur.
The macOS all-controls Tab lane requires Keyboard navigation enabled.
