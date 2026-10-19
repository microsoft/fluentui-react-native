# Popover accessibility

## Trigger

The trigger is a FURN Button and keeps Button's role, name, disabled state,
and focus visual policy. Popover adds `accessibilityState.expanded`, which
reflects whether the popup is actually presented rather than the requested
`open` value, so a natively dismissed popup reads as collapsed. Caller
accessibility state merges with it.

React Native has no typed has-popup or controls property on Windows or macOS.
Popover therefore supplies the default hint `Opens a popover` when the caller
gives the trigger no `accessibilityHint`. A hint describes the behavior; it is
not a programmatic relationship (`popover-group-semantics`).

## Surface

The surface is the native popup's content View. It is accessible with the
`group` role and takes its name from the surface `accessibilityLabel`; Popover
warns in development when the name is missing. Windows maps the role to the
UIA Group control type and macOS to `AXGroup`. Content inside the surface keeps
its own roles, names, and states and remains individually reachable.

A dialog role is not used: React Native Windows maps no dialog role, and a
role string or announcement is not proof of native dialog semantics.

## Presence

Closed content is not rendered, so it is absent from the accessibility tree
and the tab order. The surface's ref is null while closed. When the surface
has no focusable content, Popover makes the surface itself a focus stop only
for that presentation so keyboard and screen-reader focus can enter it.

## Qualification

Native state reads are necessary but not sufficient. Each renderer must
qualify the trigger's expanded state, the surface group and name, entry focus,
and focus return with VoiceOver and Narrator before release, and the Windows
ExpandCollapse projection must be invoked rather than inferred.
