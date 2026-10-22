# MenuButton interaction

## Closed

| Input           | Result                                                       |
| --------------- | ------------------------------------------------------------ |
| Pointer press   | Opens the menu with Menu's pointer entry; reports `trigger`. |
| Enter or Space  | Opens the menu and focuses its first row; reports `trigger`. |
| Down            | Opens the menu and focuses its first row; reports `trigger`. |
| Up              | Opens the menu and focuses its last row; reports `trigger`.  |
| Tab / Shift+Tab | Moves focus to and from the trigger as usual.                |

A disabled MenuButton ignores every opening input.

## Open

Menu owns navigation, submenus, hover, and activation inside the menu.

| Input                   | Result                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------- |
| Row activation          | Runs the row's `onPress`; the menu closes; focus returns to the trigger.                |
| Escape in the root menu | The menu closes; focus returns to the trigger.                                          |
| Tab                     | The menu closes; focus moves to the next focusable view after the trigger.              |
| Shift+Tab               | The menu closes; focus returns to the trigger.                                          |
| Pointer input outside   | The menu closes; focus returns to the trigger unless the input focused another control. |
| Trigger press           | The menu closes and does not reopen.                                                    |

Opening another MenuButton's trigger with the pointer closes this menu through
light dismissal and opens the other one.

## Presentation

The menu opens below the trigger, start-aligned, and flips above it when it
does not fit. Its width follows its widest row. The trigger keeps its pressed
chrome while the menu is presented; the chevron does not rotate.
