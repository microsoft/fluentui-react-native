---
component: MenuButton
platform: react-native (Windows, macOS)
---

# MenuButton Interaction (React Native — Windows & macOS)

MenuButton's keyboard model spans two surfaces: the **Trigger** (`<button>`, focused when Closed) and the **MenuItems** inside the Menu (focused individually when Open via the Menu's own roving-tabindex model).

## Keyboard navigation

### When Closed (DOM focus on Trigger)

- **Tab / Shift+Tab** — moves focus to and from the trigger.
- **Enter / Space** — opens the Menu. DOM focus moves into the Menu to the first MenuItem.
- **Arrow Down** — opens the Menu and moves focus to the first MenuItem.
- **Arrow Up** — opens the Menu and moves focus to the last MenuItem.
- **Escape** — no effect (the Menu is already closed).

### When Open (DOM focus on a MenuItem inside the Menu)

Keyboard navigation inside the Menu is owned by `flex-components:menu`. The trigger-relevant behaviors:

- **Enter / Space on a MenuItem** — activates the action, closes the Menu, returns focus to the trigger.
- **Escape** — closes the Menu, returns focus to the trigger. Does not propagate to surrounding handlers.
- **Tab from inside the open Menu** — closes the Menu and moves focus forward past the trigger to the next focusable element on the page.
- **Shift + Tab from inside the open Menu** — closes the Menu and returns focus to the trigger.

See `flex-components:menu` § Keyboard navigation for the in-Menu arrow / Home / End / type-ahead model.

## Focus management

- **DOM focus moves between the Trigger and the MenuItems.** When Closed, focus is on the Trigger. When Open, focus is on whichever MenuItem received it on open or has been navigated to since.
- **Initial focus on Open:** the first MenuItem in the Menu. (Unlike Dropdown, MenuButton has no "currently selected" item to land on — actions are not stateful.) Arrow Up at open is the only path that lands focus on the last item instead of the first.
- **Focus ring placement:**
  - Trigger uses Button's universal dual-outline focus ring per `flex-system:styling`. Inherits from `flex-components:button`.
  - Focused MenuItem uses the universal dual-outline ring per `flex-components:menu-item`.
- **Focus return on close:**
  - Closing via item activation, Escape, click-outside, or Shift+Tab returns DOM focus to the Trigger.
  - Closing via Tab moves DOM focus forward past the Trigger to the next focusable element.

The Menu is **not** a focus trap. Tab and Shift+Tab dismiss it cleanly into the surrounding page tab order, matching Menu's standard behavior.

## Open / close

| Trigger | Behavior |
|---|---|
| Click on Trigger | Toggles Open. Closed → Open mounts the Menu and moves focus to the first MenuItem. Open → Closed dismisses the Menu and returns focus to the Trigger. |
| Enter / Space on Trigger | Opens the Menu and moves focus to the first MenuItem. |
| Arrow Down on Trigger | Opens the Menu and moves focus to the first MenuItem. |
| Arrow Up on Trigger | Opens the Menu and moves focus to the last MenuItem. |
| Click on a MenuItem | Activates the action, closes the Menu, returns focus to the Trigger. |
| Enter / Space on a focused MenuItem | Activates the action, closes the Menu, returns focus to the Trigger. |
| Escape (Menu open) | Closes the Menu, returns focus to the Trigger. |
| Click outside | Closes the Menu (light dismiss via `flex-components:popover`), returns focus to the Trigger. |
| Tab from inside an open Menu | Closes the Menu, moves focus forward past the Trigger. |
| Shift + Tab from inside an open Menu | Closes the Menu, returns focus to the Trigger. |

## Positioning

Menu positioning is owned by `flex-components:popover` § Positioning, via `flex-components:menu`. MenuButton defaults:

- **Preferred side:** bottom (`block-end`). The Menu opens below the Trigger.
- **Alignment:** start-aligned to the Trigger's inline-start edge.
- **Flip:** if the bottom placement would clip below the viewport, flip to top (`block-start`).
- **Width:** Menu width is content-driven (widest MenuItem) — does not stretch to the Trigger.
- **Arrow:** hidden by default — the chevron on the Trigger already signals the relationship.

## Animation

- **Open:** Menu entrance fade + optional subtle scale (~200–300ms ease-out) per `flex-components:menu`.
- **Close:** Menu near-instant fade-out.
- **Trigger state:** Background and foreground color transitions ≤150ms ease-in-out (inherits Button motion). Focus may be instant.
- **Trigger chevron:** Static — does not rotate or swap on Open.
- **MenuItem state:** Owned by `flex-components:menu-item`.

> **Reduced motion:** When the OS reduce-motion setting is set, Menu appears and disappears without animation and trigger color transitions are removed. MenuItem state transitions are removed per their own component.
