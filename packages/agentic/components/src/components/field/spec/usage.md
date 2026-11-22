# Using Field (proposed)

For a **Project code** editor, the application supplies the label, a helper such as “Use the code
on your invitation”, and the current validation result. In `renderControl`, take the name, size and
disabled/error flags from the binding and pass them to the editor's supported API. Bind current
description identities on the editor's accessible element. Do not spread the binding onto the
outer View or remove the helper when an error appears.

For a **Reminder frequency** group, bind the Field name to the group's accessible element, preserving
each option's name. A group target cannot implicitly select an option. For two unrelated editors,
such as project code and display name, render separate Fields.

Use horizontal layout when the label column has room at the user's text scale. Keep a full correction
visible in the validation row; do not truncate it to match the height of the adjacent editor. Use
InfoLabel for optional explanations or examples, not for the only copy of instructions or feedback.
