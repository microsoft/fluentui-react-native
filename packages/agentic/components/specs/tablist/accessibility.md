---
component: Tablist
platform: react-native (Windows, macOS)
---

# Tablist Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `tablist` on the container element.
- **Required attributes:**
  - `aria-label` — required on the Tablist container; describes the navigation purpose (e.g., "Message categories", "Settings sections").
  - `aria-orientation="horizontal"` — explicit orientation for screen readers (horizontal is the default for `role="tablist"`, but explicit declaration is preferred).
  - Each child Tab requires `role="tab"`, `aria-selected`, and `aria-controls`.
  - Each associated content panel requires `role="tabpanel"`, `aria-labelledby` referencing its Tab.
- **WCAG:**
  - **1.3.1 — Info and Relationships:** Tablist grouping must be programmatically determinable via `role="tablist"`. Tab-to-panel relationships must be explicit via `aria-controls` / `aria-labelledby`.
  - **2.1.1 — Keyboard:** All non-disabled Tabs must be reachable via arrow key navigation within the Tablist.
  - **2.4.7 — Focus Visible:** Focus ring on the active Tab must be visible. Uses the system focus ring from child Tab.
  - **2.5.8 — Target Size (Minimum, AA):** Tab children meet the minimum boundary at 32px height. Ensure Tablist gap does not cause adjacent targets to overlap.
- **Screen reader:** Announces Tablist label, number of tabs, and current position. Each Tab announces its label, role, selection state, and position within set.

---

## Usage

- **Accessible name:** Always provide `aria-label` on the Tablist container. The label must describe the navigation purpose, not list the tab names.
- **Tabpanels:** Always pair each Tab with a `role="tabpanel"`. Every Tab must control a corresponding panel. Hidden panels should use `hidden` or equivalent — do not remove them from the DOM.
