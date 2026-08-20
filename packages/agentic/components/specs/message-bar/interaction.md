---
component: MessageBar
platform: react-native (Windows, macOS)
---

# MessageBar Interaction (React Native — Windows & macOS)

## Dismissal

The dismiss button closes the MessageBar. Dismissal state is managed by the parent — the component does not track its own visibility. Once dismissed, remove the bar from the DOM (not `display: none`) so screen readers do not encounter it.

## Actions

Action buttons are Small Subtle Buttons embedded within the component. Up to two actions are shown. If more responses are needed, use a Dialog.

## Overflow

Message text fills available width and truncates with ellipsis in the design. In code, allow wrapping by default — single-line truncation is only appropriate in constrained-width layouts.

## Animation

No show/hide animation is specified in the design. If entry animation is added in code, use a fast opacity fade (≤150ms).

> **Reduced motion:** Remove all show/hide transitions when the OS reduce-motion setting is set.
