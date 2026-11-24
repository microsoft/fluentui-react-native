# RangeTarget (AppKit preview)

`RangeTarget` is one transparent native focus and accessibility target exported by
`@fluentui-react-native/native-core/macos`. Its parent renders the visual geometry and chooses the numeric scale.
For a two-ended interval mount two stable targets and give each its own name and currently allowed bounds.
Do not hide one target behind the other when they share coordinates.

`minimum`, `maximum`, `step`, `value`, and `hasValue` describe the accepted value. AX exposes a numeric value, or
no number when unset, with optional caller-localized `valueDescription`. Native AX increment, decrement, and
numeric SetValue and focus-owned keyboard input report the requested number through `onValueRequest`.
The request does not replace the accepted value; the owner applies its quantization and commits by updating props.
Disable or read-only refuses native adjustment. No pointer behavior is implicit in this target.

Native adjustment must be exercised independently from reading a value or sending physical arrows.
Generated Windows descriptors are not a registered UIA RangeValue provider.
