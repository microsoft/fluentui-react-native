---
component: Interaction Tag
platform: react-native (Windows, macOS)
---

# Interaction Tag Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus between the primary action area and the secondary action (dismiss button). Both are independent tab stops.
- **Enter / Space** on primary action area — triggers the primary action (context-dependent: open popover, navigate, etc.).
- **Enter / Space** on secondary action — triggers dismiss (removes the tag).
- **Arrow keys** — no arrow-key navigation within a single Interaction Tag. Arrow navigation between tags in a group is the responsibility of the parent container.

## Focus management

Each interactive area (primary action, secondary action) receives its own focus ring independently. Focus follows standard platform tab order: primary action first, then secondary action (left-to-right reading order).

- Focus does not trap within the tag. Tab moves to the next element in the document order after the secondary action.
- If the primary action opens a popover or overlay, focus management for that surface is owned by the popover component (`flex-components:popover`).

## Focus ring placement

- **Primary action area:** Focus ring wraps the leading portion of the container (from the leading edge through the label, stopping at the divider). Inherits the container's leading-side border radius.
- **Secondary action area:** Focus ring wraps the trailing dismiss button region. Inherits the container's trailing-side border radius.

## Animation

State transitions (Rest → Hover) are platform-driven color transitions on each interactive area independently. Duration and easing reference motion tokens once defined.

> **Reduced motion:** When the OS reduce-motion setting is set, all transitions should be instant. No scale, translate, or opacity animation is used on Interaction Tag.
