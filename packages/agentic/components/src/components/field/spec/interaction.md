# Field interaction

The application chooses validation timing and supplies the status/message together. Field never
intercepts typing, Enter, focus loss or selection to run a validator. Tab normally reaches just the
control; an InfoLabel adds its help button in reading order before the control. A label click can
use the explicit target; clicking the helper, status icon or container must not submit or activate.

On changing from `error` to `warning`, keep the editor mounted and preserve the caret. Remove invalid
state, change the feedback text/icon and update the same logical description and announcement owner.
On `disabled`, remove feedback from the visible and accessible descriptions, keep a supplied helper,
and block label and help actions. Recover from the **current** props, not the old pre-disable error.
Field does not clear the value or choose a new selection.

Keep geometry stable except for content's natural reflow; do not reserve an invisible message or
animate a stale error after correction. Moving between vertical and horizontal layouts must not
remount the bound control. Exercise long localized strings, RTL and increased system text size.
