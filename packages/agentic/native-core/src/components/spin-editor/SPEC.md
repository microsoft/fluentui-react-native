# SpinEditor (AppKit preview)

`SpinEditor` uses one AppKit text editor and two pointer-only step buttons. It is exported through
`@fluentui-react-native/native-core/macos`. The field owns text editing and assistive adjustment; the buttons
do not introduce extra sequential stops. The owner supplies localized names and keeps committed `numericValue`
separate from the visible `draft`.

Editor events distinguish text changes, commit, revert, keyboard/pointer step, larger step and native AX
adjustment. Marked text takes precedence over Return, Escape and navigation shortcuts. The owner parses,
validates, and commits; property updates do not synthesize user events. `disabled` removes editing and
stepping; `readOnly` preserves text reading and selection but refuses adjustment.

Confirm native AX writeback and text/selection behavior independently from JavaScript event tests.
There is no Windows or Win32 editor provider in this preview.
