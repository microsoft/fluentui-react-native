---
component: Badge
platform: react-native (Windows, macOS)
---

# Badge Interaction (React Native — Windows & macOS)

## Keyboard navigation

None — Badge is not focusable and is not part of the tab order. If the host control (Button, NavItem, ListItem, Avatar wrapper) is interactive, that wrapper owns the tab stop and keyboard handlers. Badge content folded into the wrapper's accessible name surfaces in the screen reader announcement; see `accessibility.md`.

## Focus management

None — Badge does not receive or manage focus and renders no focus ring. Wrappers that make the host control interactive must render their own focus ring on the wrapper, not on the Badge.

## Animation

None on the component itself — Badge has no Hover, Pressed, Focus, or Disabled state to transition between. If a parent control animates Badge in or out (a counter incrementing, a status changing), the parent owns that motion and its tokens.

> **Reduced motion:** Because Badge has no animation, no reduce-motion accommodation is required on the component. Parents that animate Badge appearance must respect the OS reduce-motion setting themselves — typically by removing the transition entirely rather than swapping to a shorter duration.

## Positioning

Badge has no built-in anchoring behavior. Placement against a host control is the consumer's responsibility — typically via absolute positioning at the top-right corner of the host for counter-style Badges, or inline alongside a label for status-style Badges. The Badge container itself flows as a normal inline-block element.

## Responsive behavior

Badge sizes via the Size variant (Small or Medium), not via CSS scaling. Layouts that need a different visual scale must pick a different Size variant rather than applying CSS `transform: scale()` or width/height overrides — those would desync typography, padding, and icon size from the token system.
