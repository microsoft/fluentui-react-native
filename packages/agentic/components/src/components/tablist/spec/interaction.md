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

Target eligibility/selection are committed before the layout-effect focus
request. The active tab stop is distinct from the last confirmed native focus
value. Targets register ref-backed controllers; native focus events confirm
requests, and removal/replacement cancels stale requests. Modified shortcuts
are not consumed. Each Tab's semantic select accessibility action uses the same
collection selection owner: `select` on Windows Fabric, `Select` on Win32, and
the existing `Select` custom action on macOS. The Tab resolves the declaration
and event name together, guards disabled selection, and forwards the original
caller accessibility event once without synthesizing `onPress`. This custom
action path does not establish default macOS AXPress support.

## Pointer

Pointer activation uses the existing Tab hit area and hover and pressed states.
The list does not add an overlay. A pointer press moves the active entry and
requests selection while preserving the Tab's own `onPress`.
Windows/Win32 then request focus through the committed target. Pointer selection
does not impose that Windows click-focus policy on macOS.

## Motion

TabList adds no animation. Tab selection presentation changes through the
existing Tab render, so reduced-motion settings require no group branch.

## Focus target lifetime

Tabs register stable, ref-backed targets. The collection requests focus after
eligibility commits and confirms it from native focus events. Superseded or
removed targets cancel pending work; the public structural root ref is unchanged.

## Executable focus coverage

The WDIO `FocusManagement` cases verify native selected/focused states,
selection observed at the focus event, disabled skipping, wrap, Home/End,
and unconsumed modifier delivery to the parent. The native host may move focus
for those modifier chords; TabList must not consume them or change selection.
`ManualFocusManagement` proves focus can move independently until Enter selects
the focused Tab.
