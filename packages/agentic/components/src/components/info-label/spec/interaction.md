# InfoLabel interaction

The label delegates only to its bound form target. The sibling info button opens or closes help on
activation; it does not open on hover or simply because the form field received focus. Keep the
same button as the accessible trigger, popup anchor and return destination.

On presentation, wait for the native popup before requesting entry focus. Text-only help can use the
named surface as the target; otherwise enter at the first eligible child. For Escape or an explicit
close while focus is inside, restore the live trigger if it is still eligible. On outside pointer
dismissal do not override the user's new focus. Do not focus a replacement trigger after detach.

The intended Tab behavior is to dismiss at either boundary and continue in the owner window.
Record a host's actual fallback separately, including Office Win32 forward continuation and
Popover's current contained cycle. Neither is proof of natural exit. The popup is not modal and
InfoLabel must not add a second focus trap, second Escape listener or its own entrance animation.
See [Popover interaction](../../popover/spec/interaction.md) and the [popup continuation issue](https://github.com/microsoft/fluentui-react-native/issues/4377).
