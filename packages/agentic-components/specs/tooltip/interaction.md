---
component: Tooltip
platform: react-native (Windows, macOS)
---

# Tooltip Interaction (React Native — Windows & macOS)

## Show / hide

Tooltip has no interactive states of its own. Show/hide is initiated by the trigger element and maintained while either the trigger or tooltip is hovered, so magnified users can move the pointer over the tooltip to read it.

| Trigger | Behavior |
|---------|----------|
| Pointer enters trigger | Tooltip becomes visible after a short delay (~300ms) |
| Pointer leaves trigger | Tooltip remains visible if the pointer moves onto the tooltip; otherwise it hides |
| Pointer enters tooltip | Tooltip remains visible |
| Pointer leaves tooltip | Tooltip hides unless the trigger is still hovered or focused |
| Trigger receives keyboard focus | Tooltip becomes visible immediately |
| Trigger loses focus | Tooltip hides |
| `Escape` key | Tooltip hides; focus remains on trigger (WCAG 1.4.13) |

## Animation

Tooltip fade-in references motion tokens once defined. Duration should be short (≤150ms) with ease-out. Fade-out should be near-instant.

> **Reduced motion:** When the OS reduce-motion setting is set, appearance and disappearance should be instant with no transition.
