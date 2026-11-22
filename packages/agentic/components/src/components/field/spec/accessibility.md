# Field accessibility

Bind the name, required/invalid state and descriptions to the element that exposes the value, or to
the group that contains the individually named options. The root is a layout container, not another
form control. `labelID` denotes the visible name; `descriptionIDs` contains the IDs of the persistent
helper and active feedback, in that order, with missing entries omitted. A stable message ID may
be reused within one Field but never shared between Field instances.

Use a verified native relation where the host supports it. The Label name fallback is allowed when
the relationship cannot be expressed. For descriptions, a visible message plus an initial announcement
is not enough: navigate away, return to the control, and check that the current explanation is still
discoverable. On a host accepting only one description target, do not join multiple IDs into a
string and assume it works. A single combined description is a candidate only if it preserves
helper-before-feedback order and updates/removes correctly on native read-back. Never concatenate
an error into the control's name or require a tooltip to discover it.
The existing [Dropdown limitations](../../dropdown/spec/accessibility.md) illustrate why this remains
an endpoint gate. Only an error marks the field invalid; warning and success are not errors.

**Planned native evidence (FLD-001/003/004/006):** inspect each relation on the actual UIA/AX control,
then use Narrator/VoiceOver with the editor still focused. Change helper only, add an error, repeat
the same render, replace the message, then disable and re-enable. Check order, no duplicate speech,
no stale relation, unchanged focus and a still-readable label. Repeat with a group; its individual
options must retain their own names. Do not claim a platform passed from role or text snapshots alone.
