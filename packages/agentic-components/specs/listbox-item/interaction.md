---
component: ListboxItem
platform: react-native (Windows, macOS)
---

# ListboxItem Interaction (React Native — Windows & macOS)

## Keyboard navigation

The parent Dropdown owns the keyboard model and moves DOM focus between row buttons. Individual ListboxItem rows handle only their own activation key (Enter / Space); arrow-key navigation between rows is the parent's responsibility.

- **Enter / Space** — activates the focused row. The parent Dropdown decides what activation means per its Selection mode: Single → commit the value and close the Popover; Multiple → toggle the row's `aria-pressed` state and keep the Popover open.
- **Arrow Up / Arrow Down** — handled by the parent Dropdown. ListboxItem does not implement its own arrow-key handlers. The parent moves DOM focus to the next / previous row's `<button>`.
- **Home / End** — handled by the parent Dropdown; moves DOM focus to the first / last row's `<button>`.
- **Right Arrow** — only meaningful when `Chevron=true` (hierarchical option set). Parent Dropdown expands the nested group or moves focus into it; otherwise no-op.
- **Left Arrow** — only meaningful when inside an expanded group. Parent Dropdown collapses or returns to the parent.
- **Escape / Tab** — handled by the parent Dropdown for Popover dismissal. ListboxItem does not intercept these.

Section Header rows are skipped during keyboard navigation — they are not focusable.

## Focus management

ListboxItem rows receive **real DOM focus** from the parent Dropdown. The parent moves focus between rows (and onto the initially-selected row when the Popover opens) by calling `.focus()` on the target row's `<button>`. There is no `aria-activedescendant`.

ListboxItem renders the universal dual-outline focus ring (see `flex-system:styling`) when its `<button>` matches `:focus-visible` — the same mechanism used by every other focusable element in the system. The ring is absolutely positioned over the row and overlays content without affecting layout dimensions.

ListboxItem must not set its own `tabindex`. The parent Dropdown controls the focus model: typically the focused row carries `tabindex="0"` while the rest carry `tabindex="-1"` (a roving tabindex pattern). When the parent Dropdown closes the Popover, focus returns to the Dropdown trigger — that is the Dropdown's responsibility, not ListboxItem's.

## Animation

State transitions (Rest → Hover, Selected toggling, focus moving between options) are platform-driven color transitions. Duration and easing reference motion tokens once defined.

Focus moves between rows can fire rapidly when a user holds an arrow key. Keep transitions short (≤150ms) to avoid the focus ring trailing behind the user's input.

> **Reduced motion:** When the OS reduce-motion setting is set, all transitions should be instant. No scale, translate, or opacity animation is used on ListboxItem.
