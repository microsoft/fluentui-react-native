# Button accessibility

The Pressable root is the single accessible button. Disabled state is owned by
Button; other caller accessibility values remain intact. Button is action-only
and does not declare a Toggle action. Use the separate
[ToggleButton contract](../../toggle-button/SPEC.md) for persistent state.

Plain content or plain content-slot children supply a default name. String and
numeric content are both supported. Explicit native and ARIA names or
label references take precedence. Rich content requires caller-supplied naming.

An icon-only button needs a concise accessible name that describes the action,
not the artwork. Development builds warn for a missing name. Leading and
trailing icons are decorative and never supply a second accessible element.

Disabled buttons do not activate or receive focus. The root uses the shared
[focus visual policy](../../../../references/higher-order-components.md#focus-visual-policy):
Windows/macOS use the renderer's ring; Win32 uses a custom ring driven by
the scene's input modality. Focus does not change the accessible name.
