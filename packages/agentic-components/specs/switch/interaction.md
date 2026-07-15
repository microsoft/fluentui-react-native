---
component: Switch
platform: react-native (Windows, macOS)
---

# Switch Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Space** — Toggles the switch between checked and unchecked.
- **Enter** — Toggles the switch (consistent with form control activation).
- The switch is a single tab stop.

## Focus management

- Focus ring appears on the full interactive surface (track + tappable padding) — the 36px hit-area box, not just the 20px pill. The focus ring communicates the focusable element boundary.
- Focus ring uses the universal dual-outline pattern (see `flex-system:styling`).
- Focus is not trapped — Tab moves to the next focusable element.

## Animation

- Thumb slides between start and end positions on toggle. Transition should be fast (≤150ms) with ease-in-out.
- Track fill cross-fades between unchecked and checked colors on toggle.
- Reduced motion: instant state change, no animation.
