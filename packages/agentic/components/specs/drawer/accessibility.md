---
component: Drawer
platform: react-native (Windows, macOS)
---

# Drawer Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:**
  - **Overlay — Modal (default):** Use `role="dialog"` with `aria-modal="true"` — the Modal drawer traps focus and obscures main content with a scrim, making it functionally modal.
  - **Overlay — Non-modal:** Use `role="dialog"` without `aria-modal` — the drawer is a dialog surface but does not block interaction with the rest of the page.
  - **Overlay — Alert:** Use `role="alertdialog"` with `aria-modal="true"` — the Alert drawer interrupts the workflow, traps focus, and requires an explicit user action to dismiss.
  - **Inline type:** Use `role="complementary"` or a semantic `<aside>` element — the Inline drawer is a supplemental region that coexists with main content without trapping focus.
- **Required attributes:**
  - `aria-label` or `aria-labelledby` — must reference the Header title text so the drawer has an accessible name. If `aria-labelledby` is used, the `id` on the Header title node is required.
  - `aria-modal="true"` — required on Modal and Alert types only. Indicates that interaction with content outside the drawer is blocked.
  - `aria-describedby` — recommended on Alert type to reference a description of the decision or message being communicated.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Header title foreground (`--gnrc-color-foreground-neutral-primary`) must meet 4.5:1 against the surface fill (`--gnrc-color-surface-neutral-nearer`).
  - **1.4.11 — Non-text Contrast:** The Inline drawer's edge stroke (`--gnrc-color-stroke-neutral-subtle`) and Overlay drawer's shadow must provide 3:1 contrast against the adjacent surface to communicate the boundary. The Bottom drawer's top-edge stroke (`--gnrc-color-stroke-neutral-subtle`) carries this boundary, since the downward-casting shadow does not separate it from the content above.
  - **2.1.1 — Keyboard:** All interactive elements within the drawer must be operable via keyboard. Escape must close the drawer.
  - **2.1.2 — No Keyboard Trap:** Inline and Non-modal drawers must allow Tab to leave the drawer. Modal and Alert drawers trap focus intentionally (modal pattern) but Escape must provide an exit for Modal; Alert requires an explicit action button.
  - **2.4.3 — Focus Order:** Focus must move into the drawer on open and return to the triggering element on close, preserving logical reading order.
  - **2.4.7 — Focus Visible:** All focusable elements within the drawer must show a visible focus ring (universal dual-outline focus ring per `flex-system:styling`).
  - **2.5.8 — Target Size (Minimum):** Close button and footer action buttons must meet the minimum 24×24 px target size.
  - **4.1.2 — Name, Role, Value:** The drawer's role, accessible name, and modal state must be programmatically determinable.
- **Screen reader:**
  - On open, the screen reader announces the drawer's accessible name and role (e.g., "Filters, dialog" for Modal/Non-modal, "Confirm discard, alertdialog" for Alert, or "Properties, complementary" for Inline).
  - For Alert type, the description referenced by `aria-describedby` is announced after the name and role.
  - On close, focus return to the trigger causes the trigger's name and role to be announced, confirming context has returned to the main content.

---

## Usage

Implementation-time considerations that cannot be solved at build.

- **Zoom:** At 200%/400% zoom, the drawer's fixed width may consume the majority of the viewport. Ensure the drawer content reflows without horizontal scrolling. On narrow zoomed viewports, consider switching to Full size or Bottom position.
- **Reduced motion:** When the OS reduce-motion setting is active, slide and fade animations must be suppressed — the drawer should appear/disappear instantly. Reference the motion guidance in `tokens.yaml`.
- **Focus lifecycle (Overlay — Modal):** On open, focus must move to the first focusable element (close button). Focus must be trapped. On close (Escape, close button, or scrim click), focus must return to the element that opened the drawer.
- **Focus lifecycle (Overlay — Non-modal):** On open, focus should move to the first focusable element but must not be trapped. Users can Tab freely between the drawer and main content. No scrim is present.
- **Focus lifecycle (Overlay — Alert):** On open, focus must move to the first focusable element (typically the first action button). Focus must be trapped. The drawer cannot be dismissed via Escape or scrim — focus returns only when the user activates an action button.
- **Focus lifecycle (Inline):** On open, focus should move to the first focusable element but must not be trapped. Users must be able to Tab freely between the Inline drawer and main content.
- **Live regions / announcements:** The drawer does not require a live region — the role announcement on focus is sufficient. Do not add `aria-live` to the drawer container, as it would cause redundant announcements on content changes within the body.
- **Combinations:** Avoid nesting an Overlay drawer inside another Overlay drawer or Dialog — stacked focus traps are confusing for keyboard and screen reader users. If a confirmation is needed from within a drawer, use a Dialog that opens on top of the drawer and returns focus to the drawer on close.
