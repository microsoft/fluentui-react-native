---
component: MenuButton
platform: react-native (Windows, macOS)
---

# MenuButton Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:**
  - **Trigger:** native `<button type="button">`. **No `role="combobox"` and no `role="menuitem"`.** The trigger is a button that opens a menu — the menu-button pattern in WAI-ARIA Authoring Practices.
  - **Menu surface:** `role="menu"` per `flex-components:menu`. MenuButton does not override this — the Menu carries `role="menu"` and its children carry `role="menuitem"` (or `menuitemcheckbox` / `menuitemradio` when applicable).
- **Required attributes:**
  - **On the Trigger (`<button>`):**
    - `aria-haspopup="menu"` — declares that activating the button opens a menu. (Distinct from Dropdown, which uses `aria-haspopup="true"` because its popup is neither a menu nor a listbox.)
    - `aria-expanded="true|false"` — maps to the Open axis.
    - `aria-controls` — references the Menu's `id`. Required when the Menu is mounted (Open=true); may be set permanently when a stable id is available.
    - `aria-label` — required on Layout=Icon only. Must describe the action the trigger affords ("More actions", "Sort options"), not the icon name ("Kebab icon").
    - `aria-disabled="true"` — when State=Disabled. Prefer the native `disabled` attribute on the `<button>`.
  - **On the Menu (handled by `flex-components:menu`):**
    - `role="menu"` on the container.
    - `aria-labelledby` pointing at the trigger's accessible name, or `aria-label` on the Menu itself. One of the two is required.
    - `id` referenced by the Trigger's `aria-controls`.
  - **On MenuItems (handled by `flex-components:menu-item`):**
    - `role="menuitem"` for plain action items; `role="menuitemcheckbox"` or `role="menuitemradio"` when the item carries selection state.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Trigger label, icon, and chevron colors must meet 4.5:1 against the trigger's background at rest. Forwarded from Button.
  - **1.4.11 — Non-text Contrast:** Outline-style trigger stroke must meet 3:1 against the immediately surrounding page color. Forwarded from Button.
  - **2.1.1 — Keyboard:** Full keyboard support per `interaction.md` — Enter/Space/Arrow open the Menu; in-Menu Arrow/Home/End/type-ahead handled by `flex-components:menu`.
  - **2.4.3 — Focus Order:** DOM focus moves Trigger → MenuItems (on Open) → Trigger (on close via activation/Escape/click-outside/Shift+Tab) or Trigger → MenuItems → next focusable element (on Tab-to-dismiss). No focus is dropped to the document body.
  - **2.4.7 — Focus Visible:** Trigger uses Button's universal dual-outline focus ring. Focused MenuItems use the same ring per `flex-components:menu-item`.
  - **2.5.8 — Target Size (Minimum, AA):** Trigger minimum interactive target is 24 px (Small Icon-and-text and Text only resultant heights; Small Icon only is 24×24 — meets the boundary). Medium (32 px) and Large (38–40 px) exceed the minimum. Verify in dense toolbar contexts.
  - **4.1.2 — Name, Role, Value:** Trigger exposes role (`button` with `aria-haspopup="menu"`), name (label or `aria-label`), and value (the Open state via `aria-expanded`).
- **Screen reader:** On focusing the Trigger, screen reader announces the label, role ("button"), "has menu" (or "submenu"), and the expanded state. On opening, focus moves to the first MenuItem; the MenuItem announces its label and role per `flex-components:menu-item`. On activating an item, the Menu closes and focus returns to the Trigger, which re-announces with "collapsed".

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **`aria-haspopup="menu"`, not `"true"` or `"listbox"`.** This is the most common bug in MenuButton implementations. `aria-haspopup="true"` is the generic fallback (correct for Dropdown, wrong here) and `"listbox"` is for combobox patterns. The trigger must declare specifically that the popup is a menu so screen readers announce it appropriately.
- **Accessible name is mandatory in Layout=Icon only.** The visible icon alone does not satisfy the labelling requirement — `aria-label` is required, and a visible `Tooltip` is required for sighted users who don't recognize the icon. Neither is optional.
- **Focus must always move into the Menu on open.** Do not leave focus on the Trigger when Open=true. Without focus moving in, keyboard users cannot operate the items.
- **Initial focus target on open:** the first MenuItem when opened via click / Enter / Space / Arrow Down. The last MenuItem when opened via Arrow Up. This matches the WAI-ARIA Menu Button pattern.
- **Focus must return to the Trigger on close — except for Tab.** Tab-to-dismiss is the one path that moves focus forward past the Trigger; every other dismissal returns focus to the Trigger.
- **Menu items fire actions, not selections.** Each MenuItem carries `role="menuitem"` (no `aria-pressed`, no `aria-selected`). If an item carries state (a toggled view setting), use `role="menuitemcheckbox"` with `aria-checked` instead — see `flex-components:menu-item`. This is the cleanest distinction from Dropdown's row-button model.
- **Reduced motion:** Menu entrance/exit is instant under the OS reduce-motion setting. No scale or opacity animation. Inherits from `flex-components:popover` and `flex-components:menu-item`.
- **Windows contrast themes (high contrast mode):** Rely on native platform behavior. Do not override stroke, foreground, or background tokens inside a `@media (forced-colors: active)` block — the platform remaps system colors automatically and overrides break the user's theme choice. Verify that the trigger's chevron uses `currentColor` so it adapts alongside the label text.
- **Zoom:** At 200% and 400% zoom, the Menu may flip placement per `flex-components:popover` § Positioning. Small-size triggers may fall below WCAG target-size under heavy zoom — prefer Medium or Large for dense toolbar contexts when zoom is a concern.
- **Combinations:**
  - **Inside a Toolbar.** Toolbar's roving tabindex still works — the MenuButton's trigger participates in the parent's focus model. Opening the Menu moves focus into the Menu; closing returns focus to the trigger, which remains the active stop in the Toolbar's roving model.
  - **Inside a Dialog.** A MenuButton inside a real `role="dialog"` is fine — the dialog's focus trap applies to the dialog, not to MenuButton's Menu. Verify that Escape on the open MenuButton only closes the Menu, not the parent dialog (handle Escape at the Menu level and stop propagation).
  - **Inside a Table row.** Common pattern (Icon only MenuButton as a row's action menu). Ensure each row's trigger has a distinct accessible name — "Actions for {row name}" — or the screen reader user cannot tell which row they're acting on.
  - **Multiple MenuButtons on a surface.** Only one should be open at a time. Opening one MenuButton typically auto-closes another via the shared light-dismiss model — verify this matches the surface's intent.
