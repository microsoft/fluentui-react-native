# Menu accessibility

## Trigger

The trigger is a FURN Button and keeps Button's role, name, disabled state,
and focus visual policy. Menu adds `accessibilityState.expanded` from actual
presence, so a natively dismissed menu reads as collapsed, and the default
hint `Opens a menu` when the caller gives no `accessibilityHint`. React Native
has no typed has-popup or controls property on Windows or macOS; the hint
describes the behavior but is not a programmatic relationship
(`menu-semantics`).

## Surfaces

Each popup surface is accessible with the `menu` role. The root surface takes
its name from the surface `accessibilityLabel`, falling back to the trigger's
string content; a submenu surface falls back to its row's label. Menu warns in
development when the root surface has no name and the trigger has no string
content.

## Rows

MenuItem keeps its reviewed roles: `menuitem`, `menuitemradio` with a
checkmark, and `menuitemcheckbox` with multiselect, each with checked state
when selectable. A row with a submenu also exposes `expanded` from its
submenu's actual presence and MenuItem's `Has submenu` hint. Section headers
are not focus stops. Disabled rows announce their disabled state; whether they
are focus stops follows `disabledFocusable` (MNU-009).

## Presence

Closed popups are not rendered, so they are absent from the accessibility
tree and the tab order. Surface refs are null while closed.

## Qualification

Native state reads are necessary but not sufficient. Each renderer must
qualify the menu role and name, row roles and states, submenu expanded state,
disabled announcements, entry focus, and focus return with VoiceOver and
Narrator before release, and the Windows ExpandCollapse projection must be
invoked rather than inferred.
