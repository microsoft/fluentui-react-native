# Menu interaction

## Presence

Requested presence (`open`, `defaultOpen`) and actual native presence are
separate. Pressing the trigger toggles requested presence and reports
`trigger`. A press that begins while the menu is open closes it and never
reopens it, even when light dismissal also observed that press. A native
dismissal reports `dismiss` and latches the menu closed while requested
presence stays true; setting it false and then true, or pressing the trigger,
opens it again. Activating a row reports `action`.

## Entry focus

| Opening input                              | Focus after native readiness             |
| ------------------------------------------ | ---------------------------------------- |
| Keyboard or accessibility activation       | The first focusable row.                 |
| Pointer press                              | The menu surface; no row is highlighted. |
| Down or Up while the surface holds focus   | The first or last focusable row.         |
| A submenu opened by Enter, Space, or arrow | The submenu's first focusable row.       |
| A submenu opened by pointer or hover       | Focus does not move.                     |

The opening input is read from the scene's input modality at the trigger
press. Every focus request is confirmed by its native outcome.

## Navigation

| Key                 | Behavior                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Down / Up           | Next or previous focusable row; wraps.                                                         |
| Home / End          | First or last focusable row.                                                                   |
| Printable character | The next focusable row after the current one, wrapping, whose label starts with the character. |
| Enter / Space       | Activates the focused row, or opens its submenu.                                               |
| Inline-end arrow    | Opens the focused row's submenu and focuses its first row.                                     |
| Inline-start arrow  | In a submenu, closes it and focuses its row.                                                   |
| Escape              | Closes the deepest popup and focuses its row, or the trigger at the root.                      |
| Tab / Shift+Tab     | Closes the whole menu and focuses the trigger.                                                 |

Type-ahead compares the first character of each row's label without regard to
case, ignores modified keys, and does not include section headers. The
inline-end arrow is Right in left-to-right layouts and Left in right-to-left
layouts.

## Pointer and hover

Pressing a row without a submenu activates it. Pressing a submenu row toggles
its submenu without moving focus. With `submenuOpenOnHover`, hovering a
submenu row for the open delay opens its submenu, and hovering another row of
the same menu for the close delay closes or switches the open submenu.
Hovering a row focuses it while the menu already holds keyboard focus.
Hover never opens the root menu. Touch and pen input do not hover.

| Platform | Open delay                               | Close delay                              |
| -------- | ---------------------------------------- | ---------------------------------------- |
| macOS    | 100 ms                                   | 300 ms                                   |
| Windows  | System menu show delay (400 ms fallback) | System menu show delay (400 ms fallback) |

macOS has no public submenu delay setting; these values approximate native
menus without pointer-travel intent (`menu-submenu-intent`).

## Dismissal and focus return

| Cause                                         | Result                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Row activation                                | Whole menu closes; reports `action`; focus returns to the trigger.                                           |
| Escape in a submenu                           | That submenu closes; focus returns to its row.                                                               |
| Escape in the root menu                       | Menu closes; reports `dismiss`; focus returns to the trigger.                                                |
| Tab or Shift+Tab                              | Whole menu closes; reports `dismiss`; focus returns to the trigger.                                          |
| Pointer input outside every popup and trigger | Whole menu closes; reports `dismiss`; focus returns to the trigger unless the input focused another control. |
| Trigger press while open                      | Menu closes; reports `trigger`; focus is where the press put it.                                             |
| Caller sets `open` false while focus is held  | Menu closes; no report; focus returns to the trigger.                                                        |
| Application deactivation or trigger detached  | Menu closes; reports `dismiss`; focus is not moved.                                                          |

Focus returns only to a live, focusable target and is confirmed by its focus
event. A presentation that never held focus does not move focus when it
closes.
