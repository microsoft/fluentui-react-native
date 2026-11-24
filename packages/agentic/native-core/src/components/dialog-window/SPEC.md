# DialogWindow (AppKit preview)

`DialogWindow` is available only through `@fluentui-react-native/native-core/macos`. An attached React view owns
one panel. `mode="modal"` and `mode="alert"` use an AppKit sheet; `mode="nonmodal"` attaches an independently
focusable child panel without disabling the owner. It does not convert an anchored Callout or cycle of views
into an isolated dialog.

The attached view must have a positive laid-out content extent. `shown` requests presentation and
`onWindowEvent` identifies `presented`, `dismiss-request`, `native-close`, `owner-lost`, `presentation-refused`,
and `focus-return`. A request does not dismiss the view until its owner accepts. Escape requests dismissal only
in non-alert modes. An unrelated attached sheet is a refusal, not an instruction to queue behind it.
Teardown detaches its touch surface and ends only its own sheet. Native owner focus is restored only if the
presentation still owns focus and the previous target remains in the same live owner.

Nested scopes, actual accessibility isolation and speech, and nonmodal exit must be verified separately from
opening and closing. No Windows or Win32 registration is implied by the generated descriptors.
