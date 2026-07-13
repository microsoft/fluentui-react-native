---
component: Breadcrumb
platform: react-native (Windows, macOS)
---

# Breadcrumb Interaction (React Native — Windows & macOS)

## Keyboard navigation

### Breadcrumb trail
- **Tab** — moves focus forward through each focusable item in the trail: BreadcrumbItems and the OverflowButton (if present). CurrentItem is not focusable and is skipped.
- **Shift+Tab** — moves focus backward through focusable items in the same order.
- **Enter / Space** — activates the focused BreadcrumbItem (triggers navigation) or opens the overflow Popover when the OverflowButton is focused.
- No arrow key navigation on the trail itself — BreadcrumbItems are individually tabbable elements, not a composite widget with roving tabindex.

### Overflow Popover (when open)
- **Arrow Down / Arrow Up** — moves focus between items in the overflow list. Focus wraps at the top and bottom.
- **Enter / Space** — activates the focused overflow item (triggers navigation and closes the Popover).
- **Escape** — closes the Popover and returns focus to the OverflowButton.
- **Tab / Shift+Tab** — closes the Popover and moves focus to the next or previous focusable element outside the breadcrumb (standard light-dismiss + tab-out behavior).

## Overflow behavior

When the trail is too long for the available width, middle items are hidden and replaced by the OverflowButton (ellipsis icon). Activating the OverflowButton opens a Popover anchored to the button. The Popover presents the hidden items as a navigable list — each item is a link or button matching the BreadcrumbItem's rendering rules.

**Opening:** OverflowButton sets `aria-expanded="true"`. The Popover renders below (or above, if constrained) the OverflowButton. Focus moves to the first item in the overflow list.

**Dismissal:** The Popover closes on:
- Activating an overflow item (triggers navigation)
- Pressing **Escape**
- Clicking or tapping outside the Popover (light-dismiss)
- **Tab** or **Shift+Tab** out of the Popover

On close, `aria-expanded` returns to `"false"` and focus returns to the OverflowButton (unless navigation was triggered, in which case focus follows the page load).

**Long lists in constrained space:** The Popover applies a `max-height` and scrolls internally (`overflow-y: auto`) when the overflow list exceeds the available viewport height. The Popover must not extend beyond the viewport — anchor it so that the full Popover height is visible, flipping above the trigger if necessary.

**Item count:** Always keep the first item and CurrentItem visible in the trail; only middle items move into the overflow Popover. Minimum one item must appear in the Popover when it opens.

## Focus management

Each BreadcrumbItem and the OverflowButton are independently focusable in source order. When the overflow Popover is closed there is no focus trap. When open, focus is scoped to the Popover and cycles through its items via arrow keys; Tab exits the Popover and dismisses it.

Focus ring placement: each BreadcrumbItem and OverflowButton delegate focus ring rendering to the Button component — see `flex-components:button`. Focus ring uses the universal dual-outline pattern (`--gnrc-color-stroke-focus-outer` / `--gnrc-color-stroke-focus-inner`) per `flex-system:styling`. Overflow list items inside the Popover follow the same focus ring rules. CurrentItem and Separator receive no focus ring and are not in the tab order.

On activation of a BreadcrumbItem or an overflow list item, focus follows the navigation — it moves to the loaded destination page per standard platform behavior. No programmatic focus management is required within the breadcrumb itself after navigation.

## Animation

BreadcrumbItem hover/pressed color transitions delegate to Button motion behavior (fast, ≤150ms, standard ease-in-out once motion tokens are defined). See `flex-components:button` `interaction.md`.

Overflow Popover open/close animation delegates to the Popover component — see `flex-components:popover`. No transition applies to the Separator, CurrentItem, or trail Container.

> **Reduced motion:** When the OS reduce-motion setting is set, all BreadcrumbItem color transitions should be instant (duration 0ms or near-0ms), consistent with Button reduced-motion behavior. Popover open/close animation is also suppressed per Popover's reduced-motion handling. No scale, translate, or opacity animation is used anywhere in the breadcrumb trail itself.
