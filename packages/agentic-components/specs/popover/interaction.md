---
component: Popover
platform: react-native (Windows, macOS)
---

# Popover Interaction (React Native — Windows & macOS)

## Show / hide

| Trigger                               | Behavior                                                           |
| ------------------------------------- | ------------------------------------------------------------------ |
| Click on trigger element              | Popover becomes visible (toggle behavior — click again to dismiss) |
| Programmatic open                     | Popover becomes visible; used for onboarding or guided flows       |
| Click outside popover (light dismiss) | Popover hides                                                      |
| `Escape` key                          | Popover hides; focus returns to trigger                            |
| Explicit close action inside popover  | Popover hides; focus returns to trigger                            |

## Focus management

- When the popover opens, focus moves to the first focusable element inside the container, or to the popover container itself if no focusable children exist.
- **Tab / Shift+Tab** cycles through focusable elements inside the popover. Focus should not leave the popover while it is open unless the user dismisses it.
- On dismissal, focus returns to the trigger element.
- When the popover is not visible, it must not be reachable via keyboard navigation or assistive technology. Ensure hidden popovers do not create invisible tab stops in the document.

## Positioning

Popover is placed relative to its trigger element. The preferred placement is specified in code (e.g., above, below, before, after). By default, the container and arrow are both centered on the trigger.

## Gap

The gap between the popover and its trigger is `--gnrc-spacing-component-base-100`. How this gap is measured depends on whether the arrow is present:

- **Without arrow:** The gap is the distance from the popover container edge to the nearest trigger edge. The container offset from the trigger is simply the gap value.
- **With arrow:** The gap is measured from the arrow tip to the nearest trigger edge, not from the container edge. Because the arrow protrudes beyond the container, the total container offset is larger — see the arrow protrusion formula below.

This token applies to all popover-based surfaces, including Menu submenus (which have no arrow and use the gap as a direct container offset).

> **Arrow protrusion formula:** The arrow is a square of side `s` rotated 45°. Its tip extends half the diagonal beyond the container edge: `protrusion = s√2 / 2`. The total container offset from the trigger edge is `gap + s√2 / 2`.

The arrow always aims for the center of the trigger — horizontal center when the popover is placed above or below, vertical center when placed to the left or right. When the container is wider or taller than the trigger, the container's center and the trigger's center are not the same point — the arrow must track the trigger's center, not the container's center. The arrow only moves off-center as a last resort when keeping it centered is geometrically impossible. The arrow must remain at least one border-radius inset from the container edge, keeping it visually connected to the flat wall of the surface.

### Viewport edge clamping

When the popover would overflow or be clipped by the viewport edge, the container must shift along its cross-axis to stay fully within bounds. This is a required behavior — popovers that render partially offscreen are a usability failure.

- For above/below placement, clamp the container's horizontal position so no part extends past the left or right viewport edge (leave a small margin, e.g. 8px).
- For left/right placement, clamp the container's vertical position so no part extends past the top or bottom viewport edge.
- After clamping the container, recalculate the arrow position so it still points at the trigger's center — the arrow tracks the trigger, not the container's midpoint. Clamp the arrow within the container's border-radius inset.
- Also clamp the primary axis: for above placement, ensure the popover doesn't overflow above the viewport; for left placement, ensure it doesn't overflow past the left edge. These cases arise when the trigger is near the corresponding viewport boundary.

## Animation

Popover entry should use a fast fade-in with subtle scale (opacity 0 → 1, slight scale-up). Exit should be a near-instant fade-out. Duration should not exceed 150ms.

> **Reduced motion:** When the OS reduce-motion setting is set, appearance and disappearance should be instant with no transition.
