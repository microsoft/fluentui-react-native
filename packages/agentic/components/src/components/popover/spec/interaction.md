# Popover interaction

## Presence and state

Requested presence is controllable. With `open`, the caller owns it; with
`defaultOpen`, Popover owns it. `onOpenChange` reports only changes a person
caused: `trigger` when the trigger toggles the popup, and `dismiss` when the
native popup closes itself. Caller-driven changes are not reported.

Native presence is authoritative. Light dismissal closes the popup
immediately and Popover then reports `dismiss`. A controlled popup whose
caller keeps `open` true stays closed until `open` becomes false then true,
or the trigger requests opening again. Popover never reopens a dismissed
presentation by itself.

## Trigger

Pressing the trigger toggles the popup and reports `trigger`. Button supplies
pointer, Enter, Space, and accessibility activation with its platform key
phase. A disabled trigger cannot open the popup but never blocks closing or
native cleanup.

Pointer input on the trigger is excluded from native light dismissal, so a
press on the trigger of an open popup closes it through the toggle instead of
closing and immediately reopening. Popover also records presence when a press
begins and does not reopen a popup that was open at that moment.

## Placement

The popup anchors to the trigger's live native view. `placement` selects the
preferred side and `align` the alignment along that edge; `start` and `end`
follow layout direction. The popup is offset by the token gap. Native placement
flips to the opposite side when the preferred side does not fit and clamps the
popup to the work area on both axes. A trigger that unmounts closes the popup.

## Focus

After the native presentation reports readiness, Popover asks native-core to
focus the first eligible content. When the popup has none, Popover makes the
surface a focus stop and focuses it. This happens on every open, whether the
trigger was activated by pointer, keyboard, or an accessibility action.
Outcomes come from native confirmation; refused, stale, and cancelled requests
are not retried with delays.

Tab and Shift+Tab move through focusable content in the popup window and wrap
there; Escape is the keyboard exit. Popover adds no Tab handling and no
roving arrow-key behavior; content owns its own navigation.

## Dismissal and focus return

| Cause                                        | Result                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| Trigger press while open                     | Closes; reports `trigger`; focus is where the press put it.               |
| Escape in focused content                    | Closes; reports `dismiss`; focus returns to the trigger.                  |
| Caller sets `open` false while focus is held | Closes; no report; focus returns to the trigger.                          |
| Pointer input outside the popup and trigger  | Closes; reports `dismiss`; focus stays where the outside input placed it. |
| Application deactivation                     | Closes; reports `dismiss`; focus is not moved.                            |
| Trigger detached                             | Closes; reports `dismiss`; focus is not moved.                            |

Focus returns only to a live, focusable trigger, and the return is confirmed by
the trigger's focus event. A presentation that never received focus does not
move focus when it closes.

## Motion

Presentation and dismissal are instant, matching the reduced-motion behavior.
Popover holds no timers.
