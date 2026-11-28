# Label accessibility

There is one visible caption, even when the indicator is visible. `labelID` identifies the native text for a
future verified relation; an independently readable static View projects the caption when the text fragment
is not a reliable native element. The required marker is decorative; the control exposes its own required
state where its native role supports it. Do not put a second required announcement on the label.
For a named group, preserve the distinct name and role of every option.

Prefer a verified relationship: inspect `LabeledBy` on the UIA control or the title element on the
macOS AX control, including after the label changes or unmounts. If the renderer cannot expose the
relationship, use the current visible string as the control's accessible name. A caller-supplied
extended name must still contain the visible name. Record the fallback for that endpoint; neither a
matching string nor a `nativeID` proves a relationship.

**Planned checks (LBL-003/004):** rename a focused field; mount two labels with identical text for
different fields; read a required, disabled field; traverse the form in both directions. Check that
the label is readable without becoming an extra button or keyboard stop. Verify Narrator on both
Windows endpoints and VoiceOver on both macOS renderers separately from automation-property reads.
