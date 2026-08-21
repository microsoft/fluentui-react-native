---
component: Dropdown
platform: react-native (Windows, macOS)
---

# Dropdown Interaction (React Native — Windows & macOS)

## Keyboard navigation

Dropdown's keyboard model spans two surfaces: the **Trigger** (`<button>`, focused when Closed) and the **item rows** inside the Popover (each a `<button>`, focused individually when Open). DOM focus moves between the trigger and the rows — there is no `aria-activedescendant`.

### When Closed (DOM focus on Trigger)

- **Enter / Space** — opens the Popover. DOM focus moves into the Popover to the currently-selected row, or to the first row if no selection.
- **Arrow Down / Arrow Up** — opens the Popover and moves DOM focus to the first / last row respectively (or to the currently-selected row if one exists and matches the arrow direction's natural landing).
- **Tab** — moves DOM focus to the next focusable element on the page (does not open Dropdown).
- **Shift + Tab** — moves DOM focus to the previous focusable element on the page.

### When Open (DOM focus on an item row inside the Popover)

- **Arrow Down** — moves DOM focus to the next row. Stops at the last row — does not wrap.
- **Arrow Up** — moves DOM focus to the previous row. Stops at the first row — does not wrap.
- **Home** — moves DOM focus to the first row.
- **End** — moves DOM focus to the last row.
- **Enter / Space** — activates the focused row.
  - Single mode: commits the value, closes the Popover, returns DOM focus to the Trigger.
  - Multiple mode: toggles the focused row's `aria-pressed` state. Popover stays open; DOM focus remains on the row.
- **Escape** — closes the Popover and returns DOM focus to the Trigger. In Multiple mode, Escape does NOT undo selections that have already been toggled — it only dismisses.
- **Tab** — closes the Popover and moves DOM focus to the next focusable element on the page (the element that would follow the trigger in normal tab order). Pending toggles in Multiple mode are not committed by Tab — they were already committed at the moment they were toggled.
- **Shift + Tab** — closes the Popover and moves DOM focus to the Trigger.

**Stop-at-edges (not wraparound) for Arrow keys** is intentional: it matches the typical Listbox / Menu pattern across Microsoft and Apple platforms and avoids the accidental "I missed it, where did focus go?" loop when users tap an arrow key one too many times. Home / End remain available for explicit jumps to the ends.

## Focus management

- **DOM focus moves between the Trigger and the item buttons.** When Closed, focus is on the Trigger. When Open, focus is on whichever row received it last (the currently-selected row on initial open, or the row the user has navigated to since).
- **Initial focus on Open:**
  1. The row whose value matches the current selection (Single mode) or the most-recently-toggled selection (Multiple mode), when one exists.
  2. The first row in the Popover when there is no selection. Implementations may expose a `disableAutoFocus` flag to suppress this default — when set, the Popover opens with focus on the Popover container itself and the user must press an arrow key to move focus to a row.
- **Focus ring placement:**
  - Trigger uses Input's stroke-swap focus pattern (boundary stroke shifts to `--gnrc-color-stroke-neutral-heavy` on `:focus-visible`) — not the universal dual-outline ring.
  - Focused row uses the universal dual-outline ring per `flex-system:styling` (Outer + Inner stroke overlay) rendered when the row's `<button>` has `:focus-visible`. Owned by `flex-components:listbox-item`.
  - The two surfaces use different focus-ring patterns because they are different tiers.
- **Focus return on close:**
  - Closing via Single-mode activation, Escape, click-outside, or Shift+Tab returns DOM focus to the Trigger.
  - Closing via Tab moves DOM focus forward past the Trigger to the next focusable element on the page.

The Popover is **not** a focus trap. Tab/Shift+Tab dismiss it cleanly into the surrounding page tab order rather than cycling among the rows.

## Open / close

| Trigger                                   | Behavior                                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Click on Trigger                          | Toggles Open. Closed → Open mounts the Popover and moves focus to the selected (or first) row. Open → Closed dismisses the Popover. |
| Enter / Space on Trigger                  | Opens the Popover and moves focus into it.                                                                                          |
| Arrow Down / Arrow Up on Trigger          | Opens the Popover and moves focus into it.                                                                                          |
| Click on a row (Single)                   | Commits value, closes the Popover, returns focus to the Trigger.                                                                    |
| Click on a row (Multiple)                 | Toggles the row's `aria-pressed` state. Popover stays open; focus stays on the row.                                                 |
| Enter / Space on a focused row (Single)   | Commits value, closes the Popover, returns focus to the Trigger.                                                                    |
| Enter / Space on a focused row (Multiple) | Toggles `aria-pressed`. Popover stays open.                                                                                         |
| Escape                                    | Closes the Popover, returns focus to the Trigger. Toggled selections in Multiple mode remain committed.                             |
| Click outside                             | Closes the Popover (light dismiss via `flex-components:popover`), returns focus to the Trigger.                                     |
| Tab from inside an open Popover           | Closes the Popover, moves focus forward to the next focusable element on the page.                                                  |
| Shift + Tab from inside an open Popover   | Closes the Popover, returns focus to the Trigger.                                                                                   |

## Positioning

Popover positioning is owned by `flex-components:popover` § Positioning. Dropdown defaults:

- **Preferred side:** bottom (`block-end`). The Popover opens below the Trigger.
- **Alignment:** start-aligned to the Trigger's inline-start edge.
- **Flip:** if the bottom placement would clip below the viewport, flip to top (`block-start`).
- **Width:** Popover stretches to at least the Trigger's width. May exceed when option labels are longer.
- **Arrow:** hidden by default — the Trigger chevron already signals the relationship.

## Animation

- **Open:** Popover fade + subtle scale (~150ms ease-out) per `flex-components:popover`. Chevron rotation (or icon swap) timed to match the Popover entry.
- **Close:** Popover near-instant fade-out. Chevron snaps back to ChevronDown.
- **Trigger state:** Stroke transitions ≤150ms ease-in-out (inherits Input motion). Focus may be instant.
- **Row state:** Row hover and focus visuals transition per `flex-components:listbox-item`.

> **Reduced motion:** When the OS reduce-motion setting is set, the Popover appears and disappears without animation. The chevron snaps to the open/closed angle with no rotation transition. Trigger stroke transitions are removed. Row state transitions are removed.
