# Popover accessibility

The trigger is the only control in the React Native view hierarchy. It uses React Native button semantics, stays accessible and focusable while it is enabled, and exposes `accessibilityState.expanded` for the current open value and `accessibilityState.disabled` for a disabled trigger. Consumer accessibility state supplied to Popover is preserved for every other key. The trigger's accessible name comes from the `trigger` slot, either from its children or from an `accessibilityLabel` supplied on that slot.

React Native has no equivalent of the web popup-type trigger attribute, so the trigger conveys its relationship to the surface through button role and expanded state alone. Popover does not claim a control relationship, because the surface is not a sibling node in the same accessibility tree.

The floating surface requires an accessible name, which comes from `surfaceAccessibilityLabel` on Popover. A missing name triggers a development warning. The name is deliberately separate from the trigger's own name so that a single label cannot silently apply to the wrong element. The surface and its content are unmounted while the popover is closed, so a closed popover contributes no accessibility node and no focus target.

The surface renders into a platform popup window. Popover applies the dialog role and the surface name to the React Native content host inside that window, which is the only node it can address. Neither the Windows nor the macOS native implementation maps a role, an identifier, or a control relationship onto the popup window itself, so the resulting native accessibility tree is not established by this contract and is tracked as the `popover-surface-dialog-semantics` divergence.

Initial focus is platform-specific. Windows moves focus into the popup and navigates to its first focusable element whenever the popup is shown. macOS makes the popup window key when initial focus is requested but does not choose a focusable descendant. Popover requests initial focus and adopts whatever each platform does; it does not synthesize a focus target.

There is no focus-return guarantee. Neither platform restores focus to the trigger on dismissal, and the native dismiss event does not distinguish an explicit dismissal from one that moves the person somewhere else. A caller that needs deterministic focus restoration should drive `open` and move focus itself.

`FocusVisual` provides the visible trigger focus feedback. It has no accessible name and cannot intercept input. No native focus visual is enabled on either platform.
