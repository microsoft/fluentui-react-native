---
component: InfoLabel
platform: react-native (Windows, macOS)
---

# InfoLabel Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** InfoLabel is a composition with three roles, not one:
  - The Label uses the native `<label>` element with a `for` attribute referencing the associated control's `id` — per `flex-components:label` → `accessibility.md`. Do not wrap the label in a `role="*"` element.
  - The trigger uses the native `<button>` element with `type="button"` so it does not submit enclosing forms — per `flex-components:button` → `accessibility.md`.
  - The Popover uses `role="dialog"` when it contains interactive content (links, buttons), or `role="tooltip"` when it contains only static descriptive text — per `flex-components:popover` → `accessibility.md`. Prefer `dialog` because InfoLabel Popovers commonly contain a link.
- **Required attributes:**
  - On the trigger Button:
    - `aria-label` — required because the trigger is Icon only. Use a descriptive name that references the field, e.g. `aria-label="More information about email address"`. Do not use the icon name ("Info icon").
    - `aria-expanded="true|false"` — reflects the Open state of the Popover.
    - `aria-controls="{popoverId}"` — associates the trigger with the Popover container.
    - `aria-haspopup="dialog"` — indicates the trigger opens a dialog-like surface. Match the actual `role` used on the Popover (`dialog` or `tooltip`).
  - On the Popover container:
    - `id` matching the trigger's `aria-controls` value.
    - `aria-label` or `aria-labelledby` — required when using `role="dialog"`. Prefer `aria-labelledby` pointing to a heading inside the content; fall back to `aria-label` ("More information about email address") if no heading is present.
  - On the Label:
    - `for` (on the `<label>` element) — must match the `id` of the associated form control. Per `flex-components:label` → `accessibility.md`.
  - On the associated form control (not on InfoLabel itself):
    - `aria-required="true"` — required when the Required boolean is `true`. The visual asterisk is for sighted users; assistive technology relies on `aria-required` on the control. Per `flex-components:label` → `accessibility.md`.
  - On disabled InfoLabels:
    - The trigger Button uses the native `disabled` attribute (removes it from the tab order) or `aria-disabled="true"` (keeps it in the tab order for announcement). The choice follows `flex-components:button` → `accessibility.md`.
- **WCAG:**
  - **1.3.1 — Info and Relationships:** The Label-to-control association must be programmatically determinable via `<label for>`; the trigger-to-Popover association must be determinable via `aria-controls` + `aria-expanded`. Visual proximity alone does not satisfy this criterion.
  - **1.4.3 — Contrast (Minimum):** Label text, trigger icon, and Popover content foreground must each meet 4.5:1 against their respective backgrounds. Trigger icon uses Button Subtle foreground (`--gnrc-color-foreground-neutral-primary` at rest); Popover content sits on `--gnrc-color-surface-neutral-nearer`. Disabled tokens are intentionally below 4.5:1; they pair with disabled controls, which are exempt under WCAG 1.4.3.
  - **2.1.1 — Keyboard:** The trigger must be operable by keyboard (Tab to focus, Enter/Space to activate). The Popover must be operable by keyboard (Tab/Shift+Tab to navigate content, Escape to dismiss). Per `flex-components:button` and `flex-components:popover`.
  - **2.1.2 — No Keyboard Trap:** Focus must be able to leave the Popover via Escape or by tabbing past the last focusable element — per `flex-components:popover` → `accessibility.md`.
  - **2.4.7 — Focus Visible:** The trigger Button must show the universal dual-outline focus ring when focused — per `flex-system:styling`. Focusable elements inside the Popover must also show their own focus rings.
  - **2.5.8 — Target Size (Minimum, AA):** The trigger is the InfoLabel's only interactive target. At all sizes (Small, Medium, Large), the trigger is Button Small Icon only (24×24) — at the minimum boundary; ensure no adjacent interactive elements encroach.
  - **3.3.2 — Labels or Instructions:** The Label inside InfoLabel satisfies 3.3.2 for the associated form control. The trigger's `aria-label` satisfies 3.3.2 for the trigger itself.
  - **4.1.2 — Name, Role, Value:** Native `<label for>`, `<button>`, and `dialog` roles expose name and role automatically. Verify the Popover's accessible name resolves (via `aria-labelledby` or `aria-label`) and the trigger's `aria-expanded` value updates as state changes.
- **Screen reader:**
  - On focus of the associated form control: announces the label string, role, value, and (when applicable) `required` — e.g. "Email address, edit text, required."
  - On focus of the trigger: announces the `aria-label`, role, and current `aria-expanded` state — e.g. "More information about email address, button, collapsed."
  - On activating the trigger: announces the Popover's accessible name and role — e.g. "More information about email address, dialog."
  - On closing the Popover (Escape, light dismiss, or close action): focus returns to the trigger; no extraneous announcement on close.

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Trigger aria-label must describe the field, not the icon.** "More information about email address" is correct; "Info icon" is not. The trigger's name tells the screen reader user what context the Popover will provide.
- **Icon-only trigger requires a visible alternative for sighted users.** Either pair the trigger with a Tooltip ("More information") on hover/focus, or ensure the surface convention makes the icon's purpose unambiguous. Never omit both — per `flex-components:button` → `accessibility.md`.
- **Required state lives on the control, not on InfoLabel.** When the Required boolean is `true`, set `aria-required="true"` on the associated form control. The visual asterisk is supplementary; without `aria-required`, screen reader users will not hear that the field is required. Same rule as Label.
- **Visible label vs. accessible name parity.** The visible Label string must match the accessible name exposed via `<label for>`. Substituting a shorter accessible name creates a WCAG 2.5.3 (Label in Name) failure for voice-control users. Same rule as Label.
- **Popover accessible name is required.** When the Popover uses `role="dialog"`, it must have an accessible name. Prefer `aria-labelledby` pointing to a heading inside the content; fall back to `aria-label`. Per `flex-components:popover` → `accessibility.md`.
- **Focus lifecycle (Open variant):** On open, focus moves into the Popover (first focusable element, or the Popover container if none). On close, focus returns to the trigger Button. The Popover should not trap focus permanently — Escape and tabbing past the last focusable element must be honored. Per `flex-components:popover` → `accessibility.md`.
- **Zoom:** Label text reflows at 200% and 400% zoom per Label's text style. The trigger Button maintains its target size at zoom because its dimensions are token-driven (icon size + padding). Long label strings wrap to multiple lines — verify the trigger remains aligned to the last line of the label (or wraps below it) without overlapping the control beneath.
- **Reduced motion:** When the OS reduce-motion setting is set, every InfoLabel transition resolves to instant — see the reduced-motion blockquote in `interaction.md` and the motion guidance in `tokens.yaml`.
- **Live regions / announcements:** Do not place the Popover content inside a live region (`aria-live`). The trigger's `aria-expanded` and the Popover's role and accessible name carry sufficient context; a live region would cause double announcement on every open.
- **Combinations:** When InfoLabel sits inside a Field that also renders helper text and validation messages, wire `aria-describedby` on the associated form control to reference the helper text and the active validation message. Multiple `aria-describedby` IDs are valid and announced in order. The Popover's content is **not** referenced by `aria-describedby` — it is a separate dialog the user opts into via the trigger.
- **Nested interactives in the Popover:** Links and buttons inside the Popover are first-class focusable elements and must show their own focus rings. Do not place a focus trap inside the Popover that overrides Popover's default focus management — the standard tab cycle is sufficient.
