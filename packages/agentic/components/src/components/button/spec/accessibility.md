# Button accessibility

## Native semantics

The root is one accessible React Native element with `role="button"`.
`accessibilityState.disabled` always reflects `disabled`. When the caller
supplies `selected`, `accessibilityState.checked` reflects its value; omission
of `selected` omits checked state. Other caller-provided accessibility state,
such as `busy`, is preserved.

The root defaults to `accessible={true}` and is focusable unless disabled.
Callers may provide an accessible name through `accessibilityLabel` or
`accessibilityLabelledBy`.

## Icon-only buttons

An icon-only button must provide a concise label that describes its action,
such as "Close dialog" rather than the icon's visual name. Development builds
warn when neither supported naming prop is present. Product UI should also
provide visible context, commonly a tooltip, for people who do not recognize
the icon.

Both icon slots are decorative children of the named root and set
`accessible={false}`. Do not give them a second announced label.

## State and focus

Disabled buttons communicate unavailable state, do not activate, and are
removed from keyboard focus. Toggle-style buttons remain one button and
announce their checked state from the externally supplied `selected` value.

The visible focus indicator is the persistent shared `FocusVisual`, which
draws inner and outer rings from focus stroke tokens. The native Windows focus
ring is disabled to prevent a competing or unstable focus border.
