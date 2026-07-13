---
component: RadioGroup
platform: react-native (Windows, macOS)
---

# RadioGroup Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** Native `<fieldset>` with `<legend>` is preferred — the platform exposes the group and its label to assistive technology automatically. When `<fieldset>` is structurally inconvenient, use `role="radiogroup"` on the container with `aria-labelledby` referencing the visible Legend (or `aria-label` if the Legend is visually hidden by design).
- **Required attributes:**
  - Accessible name on the group — `<legend>` (preferred), `aria-labelledby` referencing visible group-label text, or `aria-label` on the container. Exactly one of these must resolve to the question being answered.
  - When using `role="radiogroup"` on the container instead of a native `<fieldset>`, set `aria-orientation="vertical"` or `"horizontal"` to match the Orientation variant. Screen readers and AT may rely on this when announcing arrow-key direction hints. Native `<fieldset>` has no orientation semantic — do not add `aria-orientation` to it.
  - Each child Radio carries its own ARIA requirements (`role="radio"`, `aria-checked`, accessible name, plus the appropriate disabled mechanism — `disabled` for native inputs, `aria-disabled` for custom `role="radio"` elements) — see `flex-components:radio` `accessibility.md` `## Spec` for the per-option contract. When the entire group is unavailable, set every child Radio to Disabled rather than disabling the container.
  - **Required state:** when the RadioGroup variant `Required=true`, the composed `flex-components:label` sub-component on the Legend renders the trailing asterisk indicator. The visual asterisk is a cue for sighted users; assistive technology relies on the `aria-required="true"` attribute, which must be set on **each child Radio** (not on the group container — `aria-required` is not a valid attribute on `<fieldset>` or `role="radiogroup"`). Pair the visual asterisk and the per-Radio `aria-required` together so the required state is communicated to every audience.
- **WCAG:**
  - **1.3.1 — Info and Relationships:** The grouping must be programmatically determinable — `<fieldset>` or `role="radiogroup"` plus an accessible name on the group. Without it, assistive technology hears individual radios with no shared parent.
  - **2.1.1 — Keyboard:** Arrow keys must move focus and selection between Radios in the group; Space activates the focused Radio if it is not already selected; Tab must move focus into and out of the group as a single tab stop. Disabled radios are skipped.
  - **2.4.7 — Focus Visible:** Focus ring on the focused Radio must be visible in all non-disabled states. The ring is owned by Radio — see `flex-system:styling` for the universal dual-outline pattern.
  - **3.3.2 — Labels or Instructions:** The group must have a Legend (or equivalent accessible name) describing the choice being made, in addition to the per-option labels.
  - **4.1.2 — Name, Role, Value:** The RadioGroup must expose its accessible name and `radiogroup` role; each child Radio must expose its name, role, and current checked state.
- **Screen reader:** When focus enters the group, the Legend (or `aria-label`) is announced along with the group role and the count of options ("Plan, radio group, 1 of 3"). As arrow keys move focus, each Radio announces its own label, role, selection state, and position. The group label is not repeated for every option — only on group entry and re-entry.

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Visible-vs-hidden Legend:** When the Legend is visually hidden because surrounding context already names the choice (e.g., a section heading "Notifications" sits directly above), still provide a programmatic group label via `aria-labelledby` pointing to that heading, or via `aria-label` on the container. A group with no resolvable accessible name is not a usable RadioGroup for assistive technology.
- **Legend composition and association — they're independent.** The Legend is rendered using `flex-components:label` (Weight=Strong × Size=Medium), which provides the typography, foreground color, and the Required asterisk slot. The group's accessible name, however, is *not* established by Label's native `<label for>` mechanism — at the group level, association comes from `<fieldset>/<legend>` or from `aria-labelledby` on a `role="radiogroup"` container. Treat Label here as a visual treatment and Required-slot provider, not as a label-for-control wiring.
- **Disabling the whole group at runtime:** Set `aria-disabled="true"` (or the `disabled` attribute on a `<fieldset>`) on each child Radio rather than on the container. Screen readers may not re-announce a group-level disabled state when it changes unless focus moves through the group again — if the transition is driven by another control on the page, consider announcing the consequence via a live region so the user discovers the group is locked.
- **Reduced motion:** Handled by Radio children — see `flex-components:radio` accessibility.md. No RadioGroup-level motion exists, so no group-level reduced-motion behavior to coordinate.
- **Combinations to watch:**
  - **Inside a Dialog or Popover:** the overlay's focus trap and the group's internal focus coordination can conflict. Keyboard users must be able to move focus out of the group to reach other elements inside the overlay; the trap must not redirect focus back to the currently-Selected Radio.
  - **Nested radiogroups:** never nest one RadioGroup inside another. The arrow-key navigation model assumes a single flat group; nesting breaks the mental model and the focus model.
  - **Mixed with Checkbox in the same form section:** label the Legend and the Checkbox group label distinctly so the user can tell mutual-exclusive choices apart from independent ones at a glance.
