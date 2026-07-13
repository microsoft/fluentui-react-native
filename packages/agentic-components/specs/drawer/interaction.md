---
component: Drawer
platform: react-native (Windows, macOS)
---

# Drawer Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Escape** — closes the drawer. For Overlay type, focus returns to the element that triggered the drawer. For Inline type, focus moves to the main content area.
- **Tab / Shift+Tab** — moves focus through interactive elements within the drawer (header navigation buttons, body content, footer action buttons) in document order.
- **Enter / Space** — activates the focused interactive element (close button, action button, link, etc.). Delegated to child components (Button, Link).

## Focus management

When the drawer opens, focus moves to the first focusable element inside the drawer — typically the close button in the Header navigation slot.

- **Overlay — Modal (default):** Focus is trapped within the drawer while it is open. Tab wraps from the last focusable element back to the first, and Shift+Tab wraps from the first to the last. Moving focus outside the drawer implies closing it. On close, focus returns to the element that triggered the drawer.
- **Overlay — Non-modal:** Focus is not trapped. The user can Tab out of the drawer into the main content and back. The page is not dimmed and remains fully interactive.
- **Overlay — Alert:** Focus is trapped (same as Modal). However, the drawer cannot be dismissed via scrim click or Escape — the user must take an explicit action through the provided options (e.g., confirm/cancel buttons).
- **Inline type:** Focus is not trapped. The user can Tab out of the drawer into the main content and back. This mirrors the behavior of an inline panel coexisting with the page.

The close button and any interactive children use the universal dual-outline focus ring (`flex-system:styling`).

## Open / close

| Trigger | Modal | Non-modal | Alert | Inline |
|---------|-------|-----------|-------|--------|
| Programmatic open | Slides in; focus trapped | Slides in; focus not trapped | Slides in; focus trapped | Slides in; focus not trapped |
| Close button | Closes; focus returns to trigger | Closes; focus returns to trigger | Hidden — no close button | Closes; focus moves to main content |
| Escape key | Closes; focus returns to trigger | Closes; focus returns to trigger | No effect — must use action buttons | Closes; focus moves to main content |
| Scrim click/tap | Light-dismiss; focus returns to trigger | No scrim | No effect — cannot dismiss via scrim | No scrim |
| Action button (Footer) | Closes; focus returns to trigger | Closes; focus returns to trigger | Closes; focus returns to trigger | Closes; focus moves to main content |

## Responsive reflow

When an Inline drawer transitions to Overlay mode due to viewport constraints (see SKILL.md § Responsive reflow):

- **Focus is not disrupted.** If the user has focus inside the drawer at the time of reflow, focus remains on the same element. The focus model updates to match the new type (Overlay Modal traps focus; Inline does not).
- **No re-announcement.** The transition should not trigger a new ARIA live-region announcement or re-read of the drawer — the content has not changed, only its presentation mode.
- **Return to Inline on resize.** When the viewport widens past the breakpoint, the drawer returns to Inline mode. Focus remains undisturbed. If focus was trapped (Overlay Modal), trapping is released.

## Animation

Drawer entry and exit use a slide transition along the Position axis:

- **Entry:** slide in from the anchored edge (~200ms, ease-out).
- **Exit:** slide out toward the anchored edge (~150ms, ease-in).
- **Scrim (Overlay):** fades in/out coordinated with the drawer slide.

> **Reduced motion:** When the OS reduce-motion setting is set, the drawer appears and disappears instantly — no slide or fade animation. The scrim also appears/disappears without a fade transition.
