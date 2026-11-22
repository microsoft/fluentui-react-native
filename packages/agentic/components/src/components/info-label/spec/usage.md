# Using InfoLabel (proposed)

Use an info label when someone can complete a field without opening the help but may benefit from
an explanation. For example, a **Retention period** field can link from its help surface to a
policy. Keep the permitted range next to the editor as helper text, and a rejected value's
correction in the validation message.

Provide meaningful localized help and a specific trigger name. If there is nothing to explain,
use Label, not an empty popup. A native tooltip is not a replacement for persistent, navigable help.

Use controlled `open` only when the surrounding form needs to coordinate presentations. For example,
the form can close the first field's help when a second field opens. An ordinary InfoLabel needs
no application-wide help manager. Test the open surface in a narrow window and verify that changing
its contents never changes the label-to-control binding.
