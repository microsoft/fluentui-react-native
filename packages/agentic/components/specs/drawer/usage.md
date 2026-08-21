---
component: Drawer
---

# Drawer Usage

## When to Use

- To present supplemental information and simple actions related to the main content — property inspectors, filter panels, navigation trees, detail views.
- When the supplemental content is too complex or persistent for a Popover but does not require blocking the user's workflow like a Dialog.
- When the user should be able to reference or interact with main content while the supplemental content is visible (Inline type).

### vs Popover

A Popover is a small floating surface anchored to a specific trigger element for brief, contextual information. A Drawer is a full-height (or full-width) surface anchored to a layout edge for extended supplemental content. Use a Popover when the content is lightweight and tied to a specific element; use a Drawer when the content is richer, persistent, or related to the overall page context rather than a single trigger.

### vs Dialog

A Dialog blocks interaction with the underlying page and requires an explicit user decision before proceeding. A Drawer — even an Overlay Modal — can be dismissed freely via Escape or scrim click without resolving a decision, because the drawer's content is supplemental rather than blocking. Use a Dialog when you need the user to confirm an action or make a decision that must be resolved before continuing; use a Drawer when the content is supplemental and dismissible without consequence. (The Alert modal type is the exception — it requires an explicit action, but its purpose is still supplemental communication, not a workflow gate.)

### vs Tooltip

A Tooltip is a non-interactive label that surfaces a brief description on hover or focus. A Drawer is a full interactive surface for extended content. If the information is a short phrase or label, use a Tooltip. If it requires structure, scrolling, or interaction, use a Drawer.

---

## Behavior

- **Inline drawers push main content.** When an Inline drawer opens, the main content area resizes to accommodate it. Ensure the main content remains usable at the reduced width — if it doesn't, consider switching to Overlay type or closing other panels first.
- **Overlay Modal drawers use a scrim.** The scrim signals that focus has shifted to the drawer. Clicking/tapping the scrim dismisses the Modal Overlay drawer (light-dismiss pattern). Alert type does not support light-dismiss — the user must act through the provided options.
- **Respect viewport constraints.** On narrow viewports, Start/End drawers may consume too much horizontal space. Switch to Bottom position or Overlay type, or close other panels per the system's panel-closing logic.
- **Inline drawers reflow to Overlay automatically.** When the viewport width is too narrow to fit both the Inline drawer and at least 320px of main content, the drawer transitions to Overlay (Modal) mode. This ensures the main content is never compressed to an unusable width. When the viewport widens again, the drawer returns to Inline mode. This reflow is seamless — scroll position and content state within the drawer body are preserved.
- **Drawer state should be dismissible without consequence.** Do not place destructive or irreversible actions as the only path inside a Drawer — if the user dismisses it, no data should be lost. If unsaved changes exist, warn before dismissing.
- **Open state must be programmatically determinable.** Assistive technology must be able to determine whether the drawer is open or closed.

---

## Layout

- **One drawer per edge at a time.** Do not stack multiple drawers on the same edge — because stacking obscures content and creates confusing navigation. If a new drawer opens on the same edge, the previous one should close first.
- **Size selection depends on content complexity.** Small for simple lists or links, Medium for most panels, Large for multi-column or rich editing, Full for mobile-first or immersive experiences.
- **Bottom drawers suit mobile viewports.** On narrow screens, prefer Bottom position over Start/End because it preserves the full width of the underlying content.
- **Footer placement follows action importance.** Place the primary action on the trailing side (end edge) of the footer. Place secondary or cancel actions on the leading side.

---

## Content

- **Title must describe the drawer's purpose.** Use a concise noun phrase: "Filters", "Properties", "Details for [item name]". Avoid vague labels like "Panel" or "More" — because vague labels force users to open the drawer to discover its content.
- **Use sentence case for titles** — because sentence case is the system-wide convention for component labels, ensuring consistency across surfaces.
- **Footer button labels should use action verbs.** "Apply", "Save", "Cancel" — not "OK" or "Done" unless the action is genuinely completion-oriented.
