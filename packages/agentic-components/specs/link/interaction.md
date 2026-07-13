---
component: Link
platform: react-native (Windows, macOS)
---

# Link Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus to and from the link.
- **Enter** — activates the link (navigates to the `href` target). Native `<a href>` does not activate on Space; do not add a Space handler.
- No arrow key navigation — Link is a single focusable element, not part of a composite widget.

## Focus management

Focus follows standard platform behavior. Link does not trap focus or manage programmatic focus placement. The focus ring uses the universal dual-outline focus ring — see `flex-system:styling`. The ring is rendered with `--gnrc-border-radius-base-100` so its corners sit tight against the text bounding box rather than the surrounding line box.

## Animation

Foreground color transitions on Hover and Pressed are platform-driven and reference motion tokens once defined; duration is fast (typically ≤150ms) with standard ease-in-out. For Inline=false links, the Hover underline must appear instantly — fading the `text-decoration-line` between hidden and visible creates a flicker as the platform repaints the underline geometry.

> **Reduced motion:** When the OS reduce-motion setting is set, all color transitions are instant (duration 0ms). Underline visibility changes are always instant regardless of reduced-motion preference, for the reason above.
