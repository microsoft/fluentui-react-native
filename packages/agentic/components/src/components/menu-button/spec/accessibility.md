# MenuButton accessibility

## Trigger

The trigger is a single Pressable with the `button` role. Its name comes from
`accessibilityLabel` or the label text; an icon-only trigger requires an
`accessibilityLabel` that names the action category, and MenuButton warns in
development when neither label nor icon is present. It exposes
`accessibilityState.expanded` from the menu's actual presence and the default
hint `Opens a menu`. It never exposes checked or selected state.

React Native has no typed has-popup or controls property on Windows or macOS;
the hint describes the behavior but is not a programmatic relationship
(`menu-button-haspopup`). The chevron is decorative and inaccessible.

## Menu

The menu follows Menu's accessibility contract: each surface has the `menu`
role, the root surface name defaults to the trigger's string label, and rows
keep MenuItem's roles and states.

## Qualification

Each renderer must qualify the trigger's role, name, expanded state, and
focus return, the menu name, and Tab continuation with VoiceOver and Narrator
before release. The Windows ExpandCollapse projection must be invoked rather
than inferred.
