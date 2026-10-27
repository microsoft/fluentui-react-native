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

Without explicit native or ARIA naming or a labelled-by reference, plain
string or numeric content (including plain content-slot children) becomes
the native accessible name. Rich content requires caller-supplied naming.
Explicit names, including an empty native label, retain their existing precedence.

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

Supplying `selected`, including `false`, declares the platform's resolved
Toggle action so Win32 UI Automation can expose checked state. Caller action
labels and custom declarations are retained. The component-owned checked
value also takes precedence over a conflicting `aria-checked` alias.
Native action events are forwarded unchanged through `onAccessibilityAction`;
they neither mutate `selected` nor synthesize `onPress`. An owner handling a
native Toggle updates its own state from that event.

The focus target follows the [shared focus visual policy](../../../../references/higher-order-components.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.
