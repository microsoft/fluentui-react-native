# Dropdown interaction

## Closed

| Input           | Result                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| Pointer press   | Opens the list and focuses the entry option, or the first enabled option. |
| Enter or Space  | Opens the list and focuses the entry option, or the first enabled option. |
| Down            | Opens the list and focuses the entry option, or the first enabled option. |
| Up              | Opens the list and focuses the entry option, or the last enabled option.  |
| Expand action   | Opens the list as Enter does.                                             |
| Tab / Shift+Tab | Moves focus to and from the trigger as usual.                             |

Each opening input reports `trigger`. The entry option is the selected option
in single mode. In multiple mode it is the most recently toggled option that
is still selected, else the first selected option. A disabled option is never
the entry option. A caller-driven open behaves as Enter, and when no option is
enabled the list surface takes focus. A disabled Dropdown ignores every
opening input.

## Open

| Input                                 | Result                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Down / Up                             | Focuses the next or previous enabled option and stops at the ends.                               |
| Home / End                            | Focuses the first or last enabled option.                                                        |
| Enter, Space, or press, single mode   | Commits the option, closes the list with `select`, and returns focus to the trigger.             |
| Enter, Space, or press, multiple mode | Toggles the option; the list stays open and focus stays on the option.                           |
| Pointer hover                         | Focuses the hovered enabled option while the list holds focus.                                   |
| Escape                                | Closes the list with `dismiss` and returns focus to the trigger; toggles stay committed.         |
| Tab                                   | Closes the list with `dismiss` and focuses the next focusable view after the trigger.            |
| Shift+Tab                             | Closes the list with `dismiss` and focuses the trigger.                                          |
| Pointer input outside                 | Closes the list with `dismiss`; focus returns to the trigger unless the input focused a control. |
| Trigger press                         | Closes the list and does not reopen it.                                                          |
| Collapse action                       | Closes the list with `trigger` and returns focus to the trigger.                                 |

On Win32, Tab also returns focus to the trigger (R1). Disabled options ignore
pointer input and are skipped by every key. Opening another Dropdown with the
pointer closes this list through light dismissal and opens the other one.

## Presentation

The list opens below the trigger, start-aligned, and flips above it when it
does not fit. It is at least as wide as the trigger and grows to fit its
widest option. The option area scrolls once it is taller than 320, and moving
focus to an option scrolls it into view. While the list is presented, the
trigger keeps its focused chrome and the chevron points up. Presentation and
every visual change are instant.
