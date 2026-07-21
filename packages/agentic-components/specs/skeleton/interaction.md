---
component: Skeleton
platform: react-native (Windows, macOS)
---

# Skeleton Interaction (React Native — Windows & macOS)

## Keyboard navigation

None — Skeleton is not focusable and not part of the tab order. It is a non-interactive placeholder element.

## Focus management

None — Skeleton does not receive or manage focus. When the loading state ends and real content replaces the skeleton, ensure focus is not stranded inside a skeleton subtree mid-swap. Manage focus on the parent container that owns the loading region, not on individual bars.

## Animation

- **Default — Wave:** A lighter highlight band travels across the bar on a continuous loop. Cycle duration is approximately 1500–2000ms with linear easing so the motion reads as a steady pulse rather than a beat. The animation runs for as long as the loading state is active.
- **Synchronization:** When multiple Skeleton bars appear together, their animations must share a single timeline so the highlight band crosses every bar in unison. Use a shared `animation-duration` and `animation-delay: 0s` on all instances within a logical group; do not stagger by index.
- **End of loading:** The animation stops at the moment the bar is unmounted in favor of real content. Do not fade or wind down — the swap is instant.

> **Reduced motion:** Under the OS reduce-motion setting, the Wave animation does not run. The bar renders as a static fill at the base background color. The placeholder still communicates loading via its presence and ARIA semantics; the motion is purely supplementary and is removed without an alternative animation (no slow pulse, no fade).

## Responsive behavior

Skeleton has no intrinsic dimensions. The Bar fills the width and height set by the consumer on each instance — typically the bounding box of the content it replaces. Width and height are independent; the Bar does not enforce an aspect-ratio constraint.
