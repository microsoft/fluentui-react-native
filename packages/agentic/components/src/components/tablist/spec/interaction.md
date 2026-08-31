# TabList interaction

## Selection

Pressing a Tab requests its value and makes it the active roving-focus entry.
In uncontrolled mode TabList stores the value. In controlled mode it only calls
`onSelectionChange`; the owner must provide the next `selectedValue`.

`selectionFollowsFocus` defaults to true. With that policy, a handled
navigation key requests selection as soon as focus moves. With manual
activation, focus and selection may differ until the focused Tab is activated.

## Keyboard

Horizontal lists handle Left and Right; vertical lists handle Up and Down.
Home and End work in both orientations. Navigation skips disabled Tabs and
wraps only when `circularNavigation` is true. Unhandled keys and the inactive
orientation axis are forwarded unchanged.

Enter and Space continue through the native Tab press behavior. TabList adds no
second activation handler, preventing duplicate selection requests.

## Pointer

Pointer activation uses the existing Tab hit area and hover and pressed states.
The list does not add an overlay. A pointer press moves the active entry and
requests selection while preserving the Tab's own `onPress`.

## Motion

TabList adds no animation. Tab selection presentation changes through the
existing Tab render, so reduced-motion settings require no group branch.
