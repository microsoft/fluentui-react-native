# InfoLabel accessibility

There are three possible accessible owners: the **field** receives the visible label, the **help
button** has a caller-localized action name, and the **open surface** has a name for its contents.
Do not combine them into one accessible root. For a field titled “Retention period”, its help
button might be named “Explain retention period”; its button name never replaces the field name.
The icon adds no name. Required applies to the field, not the help button.

Expose the actual expanded/collapsed state on the button and a named nonmodal group for the
presented content. Inspect a real trigger-to-surface relationship on UIA/AX; do not infer it
from adjacent nodes, expanded state or a helpful-sounding hint. A closed surface has no accessible
descendants. Optional help is not a permanent field description; required instructions remain inline.

**Planned checks (IFL-001/002/003):** invoke the button through its native action and verify exactly
one open request, the correct popup name, and an operable help link. Re-read the form field and check
its name did not change. Test Escape, boundary traversal, disabling while open, and outside dismissal
with Narrator and VoiceOver separately from physical-key and pointer runs.
