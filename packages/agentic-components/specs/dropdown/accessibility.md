---
component: Dropdown
platform: react-native (Windows, macOS)
---

# Dropdown Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:**
  - **Trigger:** native `<button type="button">`. **No `role="combobox"`.** The combobox pattern requires a paired `role="listbox"` popup, which Dropdown does not use — the combobox role lives on the separate Combobox component (typeahead use cases). Dropdown is a button that opens a popover containing a list of buttons.
  - **Popover surface:** no ARIA role. Pure presentational floating container. Must NOT carry `role="dialog"` (would apply a focus trap that interferes with Tab-to-dismiss) or `role="listbox"` (the popup is not a listbox).
  - **Item rows:** native `<button type="button">` per row. **No `role="option"`, no `aria-selected`.** Selection state is carried by `aria-pressed` on each row's button. Owned by `flex-components:listbox-item`.
- **Required attributes:**
  - **On the Trigger (`<button>`):**
    - `aria-haspopup="true"` — declares that activating the button opens a popup. (`"menu"` and `"listbox"` are *not* used here; the popup is neither.)
    - `aria-expanded="true|false"` — maps to the Open axis.
    - `aria-controls` — references the Popover's `id`. Required when the Popover is mounted (Open=true); may be set permanently even when Closed if a stable id is available.
    - `aria-label` or `aria-labelledby` — the Trigger must have an accessible name. Inside a Field, `aria-labelledby` points at the Field label. Standalone Dropdowns must carry `aria-label`. One of the two is required.
    - `aria-invalid="true"` — when State=Error. Pairs with an error message via `aria-describedby` provided by the Field wrapper.
    - `aria-disabled="true"` — when State=Disabled. Prefer the native `disabled` attribute on the `<button>` element.
  - **On each item row (`<button>`, owned by `flex-components:listbox-item`):**
    - `aria-pressed="true|false"` — required on every row whenever the parent Dropdown is in a selection mode. Single mode: at most one row is `aria-pressed="true"`. Multiple mode: any number may be `aria-pressed="true"`.
    - `aria-label` — required when the row has no visible label (icon-only or avatar-only).
    - `aria-disabled="true"` — on disabled rows that should remain in the keyboard tab cycle so SR users can hear they exist. Otherwise use the native `disabled` attribute.
  - **On the Popover (handled by `flex-components:popover`):**
    - No ARIA role. The Popover is a presentational surface in this composition.
    - `id` referenced by the Trigger's `aria-controls`.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Trigger value and placeholder text must meet 4.5:1 against the trigger's background and the immediately surrounding page color. Error state stroke uses `--gnrc-color-stroke-danger-loud` which must meet 3:1 against the page background per 1.4.11.
  - **1.4.11 — Non-text Contrast:** Trigger boundary stroke (Outline) or bottom edge (Underline) must meet 3:1 against the *immediately surrounding* page color at rest, focus, and error — not just against the trigger's own background. Dropdowns placed on low-contrast surfaces (subtle panel on subtle page) frequently fail this; verify in context, not in isolation.
  - **2.1.1 — Keyboard:** Full keyboard support per `interaction.md` — Enter/Space/Arrow/Home/End/Escape/Tab.
  - **2.4.3 — Focus Order:** DOM focus moves trigger → rows (on Open) → trigger (on close via activation/Escape/click-outside/Shift+Tab) or trigger → rows → next focusable element (on Tab-to-dismiss). No focus is dropped to the document body.
  - **2.4.7 — Focus Visible:** Trigger Focus state uses Input's stroke swap (boundary becomes `--gnrc-color-stroke-neutral-heavy`). Focused row uses the universal dual-outline ring on `:focus-visible`.
  - **2.5.8 — Target Size (Minimum, AA):** Trigger minimum interactive target height is 24px (Small), 32px (Medium), 40px (Large). Small may fall below the 24×24 pixel minimum under heavy zoom — verify in dense form contexts.
  - **3.3.2 — Labels or Instructions:** Every Dropdown must have a programmatically-determinable label (`aria-label` or `aria-labelledby` via a Field). Unlabeled Dropdowns are one of the most common a11y audit failures.
  - **4.1.2 — Name, Role, Value:** Trigger exposes role (`button` with `haspopup`), name (`aria-label`/`aria-labelledby`), and value (the current selection — communicated by the Trigger's text content). Each row exposes role (`button`), name (label or `aria-label`), and value (`aria-pressed`).
- **Screen reader:** On focusing the Trigger, screen reader announces the label, role ("button"), "has popup", expanded state, and current value (or "no selection"). On opening, focus moves to a row; the row announces its label, role ("button"), and pressed state ("pressed" or "not pressed"). On committing in Single mode, the Popover closes and focus returns to the Trigger, which re-announces with the updated value. On toggling in Multiple mode, the row's pressed state announcement updates in place.

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Popover must NOT carry `role="dialog"` or `role="listbox"`.** This is the most common bug in Dropdown integrations. Some popover libraries default to dialog (for focus-trap convenience) — explicitly override to no role. Dialog would trap focus inside the Popover and break Tab-to-dismiss; listbox would imply the now-defunct combobox pattern and contradict the row-button model.
- **Selection state is `aria-pressed`, not `aria-selected`.** A common bug is carrying over `aria-selected` from older listbox-based Dropdown patterns. The rows are `<button>` elements; `aria-pressed` is the correct attribute on a toggle button. `aria-selected` only applies to elements inside a `role="listbox"`, `role="tablist"`, or `role="grid"` — none of which apply here.
- **Accessible name is mandatory.** Provide `aria-labelledby` pointing at the Field label (preferred) or `aria-label` (standalone). Dropdowns without names are one of the most common a11y audit failures.
- **Focus must always move into the Popover on open.** Do not leave focus on the Trigger when Open=true. Without focus moving in, the user has no way to operate the rows by keyboard.
- **Initial focus target on open:** the currently-selected row when one exists; otherwise the first row. If neither is desirable (e.g. very long lists where the user should choose where to start), the implementation's `disableAutoFocus` flag is acceptable — the Popover then receives focus on its container and the user uses arrows to move to a row.
- **Focus must return to the Trigger on close — except for Tab.** Tab-to-dismiss is the one path that moves focus forward past the Trigger; every other dismissal returns focus to the Trigger. Verify this by tabbing repeatedly through a form containing an open Dropdown — focus order must be: prior field → Trigger (open + interact) → Trigger (after Single-mode commit / Escape / click-outside) → next field. With Tab inside the open Popover: prior field → Trigger → row → next field.
- **Multiple-mode trigger display.** All three patterns (comma list, count summary, token strip) carry the same accessible name requirements — the Trigger must announce the current selection set, not just "3 selected" without the labels. Prefer:
  - Single: the chosen label rendered in the Trigger's text content.
  - Multiple: either include the labels in the Trigger's accessible name (via text content) or use `aria-describedby` pointing at an off-screen list of selected labels.
- **Multiple-mode Checkbox is presentational.** The embedded Checkbox visual inside each row's trailing slot is NOT a focusable element and does NOT carry its own ARIA semantics — its visual state is driven by the row's `aria-pressed`. Implementations must not render the Checkbox as an interactive `<input type="checkbox">`; render it as a presentational `<span>` (or `aria-hidden="true"` wrapper) styled like a Checkbox. Otherwise SRs will announce the row twice and Tab order will include the inner checkbox.
- **Windows contrast themes (high contrast mode):** Rely on native platform behavior. Do not override stroke, foreground, or background tokens inside a `@media (forced-colors: active)` block — the platform remaps system colors automatically and overrides break the user's theme choice. Verify that the trigger's chevron icon uses `currentColor` (or a system-color fill) so it adapts alongside text. The same rule applies to selection indicators on item rows.
- **Zoom:** At 200% and 400% zoom, the Popover may flip to top or be repositioned per `flex-components:popover` § Positioning. The row-list max-height should remain proportional so rows remain scrollable, not clipped. Small-size Trigger may fall below WCAG target-size — prefer Medium or Large for dense forms when zoom is a concern.
- **Combinations:**
  - **Inside a Field component.** The Field provides the label and helper/error text; Dropdown's Trigger uses `aria-labelledby` to reference the Field's label. Field's error message uses `aria-describedby`. This is the preferred integration — Dropdown alone does not own labelling or helper text.
  - **Inside a dialog.** A Dropdown inside a real `role="dialog"` is fine — the dialog focus trap applies to the dialog, not to the Dropdown's Popover (which must still avoid dialog role). Verify that Escape on the open Dropdown only closes the Dropdown, not the parent dialog (handle Escape at the Popover level and stop propagation).
  - **Inside a Toolbar or Tablist.** The roving tabindex of the parent surface still works — the Trigger participates in the parent's focus model. Opening the Dropdown moves focus into the Popover; closing returns focus to the Trigger, which is still the active stop in the parent's roving model.
  - **Multiple Dropdowns open simultaneously.** Only one should be open at a time per surface. Opening one Dropdown should not auto-close another by default, but most form patterns benefit from this behavior — flag as a product decision.

---

## Known issues

These are screen-reader / platform limitations to document rather than fix at the component layer:

- **SR support for `aria-pressed` on visually-rich buttons is uneven.** NVDA, JAWS, and VoiceOver all announce "pressed / not pressed", but the exact phrasing varies and some SRs may pause briefly before the state is read. This is preferable to the old `aria-selected`-on-`role="option"` model (which had its own announcement quirks across SRs), but worth verifying per-SR before claiming the pattern is fully covered.
- **Multiple-mode summary announcements lag selection changes.** When the user toggles rows in the open Popover, the Trigger's value display updates but its accessible name is only re-announced when focus returns to the Trigger (Escape or click-outside). Users tracking the running count by ear may want a live region; this is a product-level addition rather than a component default.
