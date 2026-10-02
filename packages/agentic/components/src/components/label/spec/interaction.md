# Label interaction

LBL-005 preserves the donor's non-interactive behavior. Label has no
press/hover/focus state, keyboard handler, focus target, focus ring, activation
action, or control ref. A pointer press on it does not focus or activate the
control. `nativeID` and accessibility references do not change that behavior.

The root must stay outside keyboard traversal. A structural View ref or Text
slot ref does not make either node a supported programmatic focus target.
Compatible slot replacements must remain non-interactive; consumers needing
an action should compose an actual control with its own reviewed behavior.

Required and disabled are externally supplied visual values. Their updates
apply immediately, including under reduced motion. Required inserts or removes
the optional marker and can change layout; Label does not reserve a ghost
marker, animate, or manage control state.

Native Tab/Shift+Tab checks should bracket Label with known keyboard targets
and assert that traversal reaches those targets without stopping on Label.
Pointer checks must assert that Label did not initiate control focus/activation,
not assume AppKit and Windows have the same pointer-focus policy.

For RadioGroup, the legend remains outside option traversal. The group owns
selection, arrow keys, entry/exit, and option activation. Label neither runs a
parallel key loop nor imports FocusZone.

Ref cleanup/detach and replacement belong to LBL-006's Framework Base slot
contract. Text measurement/scaling and trailing marker geometry belong to
LBL-009. Runtime tests and native stories are authored; none was run natively
for this recovery.
