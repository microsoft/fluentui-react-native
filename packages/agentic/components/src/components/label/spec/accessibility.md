# Label accessibility

Label is exposed as a single native text element. The root `View` is marked accessible with the React Native `text` role and carries the accessible name, and both text slots are hidden from the accessibility tree, so the label reports one element instead of a container plus separate text runs. Windows maps that element to a UI Automation text control and macOS maps it to an AX static text element.

The name comes from the `content` slot when that slot resolves to a string, either as shorthand or as string `children` in slot props. Content that is not a string has no readable name, so the caller supplies `accessibilityLabel`; a development warning is emitted when neither is present. An explicit `accessibilityLabel` always wins over the derived name.

The required indicator is decorative. It is hidden from the accessibility tree and is excluded from the derived name, so an asterisk is never announced as punctuation. Required-ness is announced by the associated control through its own accessibility state, not by Label.

Association is programmatic and is owned by the caller. Give Label a `nativeID` and point the associated control at it with `accessibilityLabelledBy`. React Native has no implicit label-to-control association, so a Label that is never referenced simply reads as text in the normal reading order. When a control both references a Label and sets its own `accessibilityLabel`, the control's explicit name wins on both platforms, so callers should set one or the other.

Label does not report a disabled accessibility state. Disabling a Label changes only its foreground color; the associated control reports the disabled state that assistive technology announces. Label also provides no accessibility actions, no focusable element, and no value.

Because a disabled label is intentionally lower contrast, do not rely on the disabled treatment alone to communicate that a field is unavailable. Keep the associated control's disabled state authoritative.

Keep the visible label text and the associated control's accessible name identical so voice-control users can say what they see. Long label text wraps to multiple lines rather than truncating, so surrounding form layout has to allow a multi-line label at large text scales.
