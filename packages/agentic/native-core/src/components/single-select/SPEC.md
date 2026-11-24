# SingleSelect (AppKit preview)

`SingleSelect` is a native `NSPopUpButton` exported by `@fluentui-react-native/native-core/macos`. Stable option
keys identify native menu items and allow equal visible labels. Disabled options remain present but are not
committable. AppKit owns type-ahead, opening, traversal, and cancellation.

`selectedKey` is the accepted choice. With no valid key, `placeholder` is the closed face and not a menu item.
A user choice requests a key; changing props or cancelling does not request anything. The native face reverts
until the owner accepts a new key. Required, invalid and description relations need verification beyond the
visible border and option projection. No Windows or Win32 picker registration is provided.
