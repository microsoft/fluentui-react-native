# Tooltip accessibility

The trigger is the only control in the React Native view hierarchy. It uses React Native pressable semantics with the `button` role by default, stays accessible and focusable while it is enabled, and reports `accessibilityState.disabled` for a disabled trigger. A trigger that wraps something other than a control can supply a different `accessibilityRole` through the `trigger` slot, because Tooltip describes a control rather than defining what the control is. Consumer accessibility state supplied to Tooltip is preserved for every other key.

Tooltip never reports expanded state on the trigger. A tooltip is a description that appears while the pointer or focus rests on a control, not a disclosure the person opens, so expanded state would announce a relationship the trigger does not have.

React Native has no identifier-based description relationship, so the label text is applied to the trigger's `accessibilityHint`, which is the platform description channel and is announced after the trigger's name and role. The trigger's accessible name still comes from the `trigger` slot, either from its children or from an `accessibilityLabel` supplied there. Because the description is derived from the label, `content` is required and must resolve to a string; an empty label raises a development warning.

The label surface renders into a platform popup window. Tooltip applies the React Native `tooltip` role and the label text to the content host inside that window, which is the only node it can address. Neither the Windows nor the macOS native implementation maps a role, an identifier, or a control relationship onto the popup window itself, so the resulting native accessibility tree is not established by this contract and is tracked as the `tooltip-surface-role-semantics` divergence.

The surface, the label, and their accessibility nodes are unmounted while the tooltip is hidden, so a hidden tooltip contributes no accessibility node and no focus target. The label is a single text node and is never interactive, so nothing inside the surface is a focus target while it is shown either.

Tooltip requests no initial focus for the surface. macOS honors that request and leaves focus on the trigger. Windows moves focus into the popup and navigates to its first focusable element whenever a popup is shown, regardless of the request, so a Windows tooltip revealed by keyboard focus takes focus away from its trigger and is then hidden again by the resulting blur. That is recorded as the `tooltip-focus-retention` divergence rather than worked around, and it means keyboard-revealed tooltips are dependable only on macOS.

`FocusVisual` provides the visible trigger focus feedback, and the RNW native focus ring is explicitly disabled so the platform cannot create a competing border visual after mount. The focus visual has no accessible name and cannot intercept input.
