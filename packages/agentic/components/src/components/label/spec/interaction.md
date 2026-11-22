# Label interaction

With the pointer, a bound label delegates on completed activation, never on press-in. An editor
target requests focus on its current editor; a choice target uses its owner's normal operation.
Dropping the pointer outside, disabling the field, or detaching the target before completion must
not act on a replacement control. A group name or an unbound label dispatches nothing.

This is not a second keyboard or assistive activation path. When a control's own named press area
already includes its label, leave the separate delegation unset. Do not forward a fabricated press
event or invoke both the field's action and its accessibility action.

The caret, focus ring and keyboard input stay with the control. Changing weight, name, required
or disabled appearance is immediate and never requests focus. Test the click result and callback
count independently of the native relationship (LBL-002/004).
