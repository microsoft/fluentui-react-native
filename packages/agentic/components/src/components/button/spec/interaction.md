# Button interaction

## State model

`usePressableState` derives hover, press, and focus from the root
`Pressable`. Token resolution uses appearance first, then selected and
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

The root follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Every platform delegates rendering and appearance to its native renderer and
hides the custom visual. The custom
visual and its border-bearing children stay in the tree for the lifetime of the
button, preserving the existing visibility calculation on the retained path.
Disabled buttons do not display focus feedback.

Button currently performs no timed state animation. Hover, press, selection,
and focus styles update immediately, so reduced-motion handling adds no
separate branch.
