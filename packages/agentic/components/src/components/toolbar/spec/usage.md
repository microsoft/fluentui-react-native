# Using React Native Toolbar

This describes the authored, reviewed API. Package exports and integrated
validation are coordinator-owned and pending in this worker patch.
See [SPEC.md](../SPEC.md) for ownership and realized files.

## Construction

Provide a purpose-oriented `accessibilityLabel` and direct ToolbarButton
commands with explicit stable `value` strings. Each command supplies a
nonnull icon and an action label. Conditional commands may use Fragments or
arrays without introducing a native wrapper into the registered order.

A small command scope named "Object actions" can contain a
`duplicate` command, an unavailable `delete` command, an unlabeled vertical
Divider with `label={null}`, and a `pin` command. The pin command's selected
value belongs to the application; its onPress updates application state.
Arrow movement must leave that value unchanged.

This API deliberately uses ToolbarButton rather than ordinary Button
children. The adapter reuses Button's actual state/style/render pipeline and
native ref, while making registration explicit. Do not clone a Button's root
to install collection behavior or assume an arbitrary component exposes its
interactive host through its public root.

## Customization

Choose `small` or `large` at Toolbar. Child appearance and size are owned by
the adapter and group. Use supported icon slots, native action handlers,
native root refs, and styles; do not supply conflicting appearance, content,
focusability, or native navigation descriptors.

Direction defaults to the application's React Native RTL setting. Supply an
explicit `direction` for a locally reversed scope so layout and arrows agree.
Do not reverse the child array solely for RTL or override Yoga direction
through a slot transform while retaining the opposite navigation mapping.

The Toolbar View ref is a structural host. A ToolbarButton ref is its
Pressable host. For programmatic child focus, respect group eligibility and
the reviewed target-request mechanism; do not call focus on a nonactive
nonfocusable leaf and infer success.

User styles are last but do not create new supported behavioral axes. Keep
the scope a single horizontal row. Put surrounding padding or a page surface
on an external container rather than turning Toolbar into another Card.

## Unsupported composition

Plain Button children, arbitrary custom wrappers, editable inputs, nested
navigation collections, and controls with interactive descendants need a
separately reviewed adapter. The approved rejection policy reports the error
and mounts no commands for that invalid scope, rather than silently dropping
one control or leaving extra tab stops. Arbitrary-child focus support is not
claimed.
Labelled commands and vertical layouts likewise belong to a different
contract rather than an undocumented variation.

On endpoints outside macOS/Windows/Win32, the component reports the excluded
platform and does not mount a desktop command scope. It is not silent mobile
support or a production FocusZone fallback.

Do not hide commands with a root style or insert unregistered focus targets
through a slot replacement. An `as` replacement must preserve the compatible
native root ref and one-target interaction contract.

## Width and overflow

Toolbar does not measure or relocate commands when space is constrained.
It does not scroll, wrap to more rows, hide children, or render a "more"
trigger. The application must provide space for all commands or choose a
different presentation explicitly. Test narrow layouts for visible,
nonoverlapping child targets; do not accept clipping as successful overflow.

None of the consulted source files requires an overflow Menu. Adding automatic
overflow later is a new capability proposal; a Menu-based design has a real
Menu prerequisite and requires focus/activation/return semantics for commands
that move between surfaces.

## Authored stories and pending acceptance

`toolbar.stories.tsx` has typed metadata titled `Components/Toolbar` and
Default, Overview, Sizes, ControlledCommands, FocusManagement, RTL,
DisabledAndDynamic, ConstrainedWidth, and Refs. ControlledCommands owns
selected state in React rather than adding a self-driving Toolbar axis.
Do not expose identity-changing selected-presence or values as live controls.

Focus stories use an editable entry outside Toolbar and a following external
focus stop. Assert native entry, arrows, wrap, Home/End, forward/reverse exit,
modifier forwarding, disabled skipping, and unchanged selection. Include
ref/identity replacement and reorder/removal without focus theft.

Executable cases use top-level named `wdio` functions typed with `WdioStory`,
stable test IDs, dynamically imported Node-only helpers, and the injected
endpoint platform. The coordinator includes the story in
`tsconfig.stories.json` and owns native app instances.

Qualification needs actual macOS, Windows Fabric, and Office Win32 results.
Missing native tree/state/action/input capabilities require explicit failures
or skips with reasons, not fabricated defaults. A bundle or zero executed
focus cases is not native acceptance.
