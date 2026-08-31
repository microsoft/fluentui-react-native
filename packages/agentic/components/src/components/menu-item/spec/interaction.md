---
component: MenuItem
platform: react-native (Windows, macOS)
---

# MenuItem Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Arrow Up / Arrow Down** — moves focus between items within the menu. Managed by the parent Menu container.
- **Enter / Space** — activates the focused List Item (triggers action or toggles Selected state).
- **Right Arrow** — opens a submenu if the item has a Chevron (submenu indicator).
- **Left Arrow** — closes the current submenu and returns focus to the parent item.
- **Home / End** — moves focus to the first or last item in the menu.
- **Type-ahead** — typing a character moves focus to the next item whose label starts with that character.

## Focus management

Focus is managed by the parent Menu container using `roving tabindex` or `aria-activedescendant`. Individual items do not manage their own focus sequence — the Menu owns it.

Section Header items are skipped during keyboard navigation — they are not focusable.

## Animation

State transitions (Rest → Hover) are platform-driven color transitions. Duration and easing reference motion tokens once defined.

> **Reduced motion:** When the OS reduce-motion setting is set, all transitions should be instant. No scale, translate, or opacity animation is used on MenuItem.
