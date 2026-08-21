---
component: Label
platform: react-native (Windows, macOS)
---

# Label Interaction (React Native — Windows & macOS)

## Keyboard navigation

Label is not a tab stop and has no keyboard interactions of its own. The associated form control owns all keyboard handling — Label only inherits the click-to-focus behavior that the platform provides natively for `<label for="...">`.

## Focus management

Label never carries focus and never displays the universal dual-outline focus ring. Focus belongs to the associated control; Label is non-interactive scaffolding.

When the user clicks Label, platforms natively forward focus to the control referenced by `<label for="...">` (or the control wrapped by the label). This behavior is not authored — it is provided by the platform when the label–control association is set up correctly. See `accessibility.md` for the association requirements.

## Animation

The only animated transition is the foreground color shift between Rest and Disabled. Match the duration to the associated control's Rest → Disabled transition so the field reads as a unified group (≤150ms ease-in-out per the `motion` block in `tokens.yaml`).

The Required asterisk's foreground also transitions on Rest → Disabled — from danger to disabled. Use the same duration.

> **Reduced motion:** Under the OS reduce-motion setting, foreground color transitions are removed entirely — the Rest → Disabled swap is instant. No scale, translate, or opacity animation is authored on Label, so reduced motion has no other effect.
