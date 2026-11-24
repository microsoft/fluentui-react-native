# Using Label

For a text entry titled **Project code**, use the same localized string for `content` and for the
editor's accessible name fallback. If using native association, give the text a stable `labelID`
and have the editor reference that text. If clicking the caption should focus the editor, supply
an editor target resolving the current `textInput` slot ref. The enclosing Input view is not the editor.

Use a choice target only when the caption sits **outside** the choice's existing press target and
its owner can perform the normal choice operation exactly once. For a caption such as **Notification
channels** above several options, use a group target: the caption names the set; clicking it does
not choose a channel. Do not label unrelated controls as a group merely to save space.

Prefer [Field](../../field/SPEC.md) when instructions or validation must remain associated with the
control. Use [InfoLabel](../../info-label/SPEC.md) for supplemental help, not to explain a required
error. Explain a required marker in the form; do not require users to infer meaning from color.
