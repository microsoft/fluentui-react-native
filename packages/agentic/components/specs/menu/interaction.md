---
component: Menu
platform: react-native (Windows, macOS)
---

# Menu Interaction (React Native — Windows & macOS)

## Keyboard navigation

Menu owns the keyboard navigation pattern for its children:

- **Arrow Down** — moves focus to the next focusable item. Wraps from last to first.
- **Arrow Up** — moves focus to the previous focusable item. Wraps from first to last.
- **Home** — moves focus to the first focusable item.
- **End** — moves focus to the last focusable item.
- **Enter / Space** — activates the focused item (triggers action, toggles selection, or opens submenu).
- **Right Arrow** — opens a submenu on the focused item (if it has one) and moves focus into it.
- **Left Arrow** — closes the current submenu and returns focus to the parent menu item.
- **Escape** — closes the menu and returns focus to the trigger element.
- **Type-ahead** — typing a character moves focus to the next item whose label starts with that character.

Section Headers and Dividers are skipped in the keyboard navigation cycle.

## Focus management

Menu uses `roving tabindex` or `aria-activedescendant` to manage focus across its children. When the menu opens, focus moves to the first focusable item (or the previously selected item, if applicable). When the menu closes, focus returns to the trigger element.

## Open / close

- **Open triggers:** Click on trigger, keyboard shortcut, right-click (context menu), Enter/Space on trigger.
- **Close triggers:** Escape, click outside the menu, selecting an item (for single-action menus), tabbing out.
- **Positioning:** Menu is positioned relative to its trigger using popover/overlay logic. Position may flip (top ↔ bottom, left ↔ right) to stay within the viewport.

## Submenu positioning

A submenu is a Popover anchored to the **triggering menu item row** (not the parent menu container). The submenu's top edge aligns with the trigger item row — not the top of the parent menu container. Placement, gap, flip, and viewport-clamping rules all follow `flex-components:popover` § Positioning — the trigger is the row, the preferred side is inline-end. Because the row is inset by the container's padding, the submenu may overlap the parent menu's padding area depending on the gap and padding tokens used.

## Animation

Menu entrance and exit transitions reference motion tokens once defined. The container should fade and optionally scale from the trigger origin.

> **Reduced motion:** When the OS reduce-motion setting is set, entrance/exit transitions should be instant.
