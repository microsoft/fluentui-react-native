# Tooltip interaction

## Revealing and hiding

Pointer entry on the trigger schedules a reveal after `showDelay`, which defaults to 300 milliseconds. The delay keeps a label from flashing while the pointer crosses the control. Pointer exit cancels a pending reveal, and hides a shown tooltip after `hideDelay`, which defaults to 0 milliseconds.

Trigger focus reveals the tooltip immediately and cancels any pending pointer timer, because a person who reached the control with the keyboard has already committed to it. Trigger blur hides it.

Pointer and focus are tracked independently. The tooltip stays visible while either the pointer or focus remains on the trigger, so moving the pointer away from a focused trigger does not hide the label, and blurring a hovered trigger does not either. Pending timers are cancelled when the opposite interaction settles the outcome and when the component unmounts.

A disabled trigger never reveals the tooltip: both the pointer path and the focus path are gated, so no timer is scheduled, and a reveal that was scheduled while the trigger was still enabled is dropped when it comes due. `disabled` never hides an already visible tooltip and never cancels a pending hide, because the visible value may be owned by the caller.

## Activation and dismissal

Trigger activation never reveals the tooltip. A tooltip describes a control, so activation is the control's own action; treating it as a reveal would make the trigger ambiguous. Activation is instead treated as a request to hide, which matches the expectation that the label goes away once the control is used. The consumer's own press handlers still run.

The label surface is a platform popup window that reports its own dismissal. A light-dismiss interaction outside the surface dismisses on both platforms; macOS also dismisses on the cancel key and when the application resigns active. Tooltip adopts every close request it receives from either the trigger or the native surface, including while `disabled` is set, so the platform can always take the tooltip away. Dismissal cannot be suppressed, because the native dismiss-behavior properties are unimplemented on both platforms.

Open requests that arrive on the same channel are ignored. Visibility is decided by the pointer and focus paths and by the caller, so an unexpected open request from the surface channel cannot show a tooltip.

## Visibility ownership

Visibility is self-driving. `defaultVisible` seeds uncontrolled state, `visible` makes the value controlled, and `onVisibleChange` reports the requested next value in both modes. A controlled value is never changed internally, so a caller that ignores the callback keeps its tooltip exactly as it declared it, including a tooltip that is permanently visible for review or for a static desktop test.

## Motion

The tooltip appears and disappears immediately. The surface is a platform popup window whose presentation is not animatable from React Native, so no fade or reduced-motion variant is declared. That is recorded as the `tooltip-motion` divergence.
