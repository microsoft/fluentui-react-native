# Toolbar native accessibility

The [reviewed contract](../SPEC.md) requires a purpose label on Toolbar and an
action label on each ToolbarButton. Empty labels are invalid. Inventory
validation rejects missing command names before mounting the command subtree;
admitted commands also retain Button's existing Framework Base label
validation. Structural/name/identity errors follow the approved effect-based
rejection diagnostics in SPEC, including release reporting.
No decorative icon supplies the command's name.

## Semantic tree (TBR-010)

The View root declares `accessibilityRole="toolbar"` and is not a keyboard
focus target or an activation owner. All command Pressables and supplied
separators must remain independently exposed. The authored `accessible={true}`,
`focusable={false}` configuration follows current TabList's named
structural-root pattern, but needs actual AX/UIA validation before native
acceptance. All three endpoints are NOT RUN in this worker session.

ToolbarButton keeps the current Button role and states. Disabled state follows
the leaf prop; unrelated caller state such as `busy` is preserved. Omitted
`selected` does not expose checked state, while either boolean supplies the
current Button checked-state presentation. Toolbar does not redefine that as
group selection or a native Toggle action.

Divider retains separator semantics and is never a focus target. Its label
slot must be explicitly absent rather than inheriting Divider's default
placeholder. Decorative command icons remain inaccessible.

Do not add synthetic set-size/position values or an orientation announcement
to simulate a browser accessibility tree. Exact role, group name, command
count, and orientation announcement are renderer/screen-reader capabilities
to observe, not guaranteed consequences of a role string.

## Keyboard accessibility (TBR-005, TBR-006)

One eligible command is an entry point; arrows and Home/End reach all eligible
commands without changing their selected state. Disabled commands stay in
the semantic tree but are not keyboard destinations. No separate
disabled-focusable mode is proposed. All-disabled scopes have no command
tab stop. Tab and Shift+Tab exit rather than cycle.

Each focused child retains the existing shared Button focus-visual policy.
Toolbar adds neither a group ring nor an extra native focus target.
Minimum hit dimensions come from Button, not a toolbar-height constant.
Spacing and separators must not reduce or overlap those targets.

## Claimed endpoints and known gaps

Windows Fabric and Office Win32 are separate qualification lanes with common
user-observable goals and distinct native transport. Verify toolbar grouping,
name, enabled/checked projection, Invoke behavior, and real focus via UIA and
Narrator. Leaf action declarations must not be invented to fill a projection
gap.

macOS uses AppKit first responders and AX/VoiceOver. Ordinary clicks need not
move keyboard focus. The all-controls Tab lane requires Keyboard navigation
enabled; record it without changing machine preferences in this phase.
VoiceOver navigation focus is not automatically keyboard self-focus.

The current repository records RNmacOS 0.81.9 Fabric disabled/selected
projection gaps. They are not intended Toolbar behavior and do not justify
fake AX values. Coordinator execution on 2026-10-02 observes the toolbar
root's native role as `unknown`. Installed RNmacOS
`React/Base/RCTUIKit.h::RCTAccessibilityRoleFromTraits` has no toolbar
conversion and returns `NSAccessibilityUnknownRole` for these traits.
The native role assertion is isolated as an explicit macOS projection skip,
separate from named-root/child discovery and keyboard/activation cases.
This blocks Toolbar role/readiness acceptance; it is not an intended
divergence or a successful fallback. Other native roles still must match
`toolbar`, and unexpected values fail rather than skipping.

Mobile accessibility and touch-target qualification are excluded. A web
companion is not evidence for those native endpoints.

## Required evidence before readiness

Record actual keyboard entry/exit, disabled skipping, RTL traversal, native
focus confirmation, and exactly-once activation on all three desktop endpoints.
Invoke the native action separately from a physical key or click.

Inspect AX/UIA trees with multiple commands and a separator. Confirm that
the root's label does not hide commands or duplicate their action labels.
Exercise VoiceOver/Narrator announcements, theme/contrast, display scaling,
active/inactive windows, and child-root `as` replacement.

A mocked accessibilityRole assertion, story bundle, or rendered status text
does not satisfy a native tree, state, action, or announcement gate. Report
passed/failed/skipped counts and reasons separately for each endpoint.
