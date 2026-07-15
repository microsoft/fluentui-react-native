---
component: Breadcrumb
platform: react-native (Windows, macOS)
---

# Breadcrumb Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** The component renders as a `<nav>` landmark. No `role` attribute is needed — the element provides it natively.
- **Required attributes:**
  - `aria-label="Breadcrumb"` — required on the `<nav>` container to distinguish this landmark from other navigation regions on the same page (e.g. primary nav, pagination). Use the localized string appropriate for each market.
  - `aria-current="page"` — required on the CurrentItem (the `<li>` or its inner element representing the current page). Do not place `aria-current="page"` on any other item in the trail.
  - `aria-label` — required on the OverflowButton (Icon only layout); must describe the action ("Show more breadcrumbs" or equivalent), not the icon ("Ellipsis"). Pair the OverflowButton with a Tooltip so sighted people who don't recognize the ellipsis icon get the same information as screen reader users — neither the `aria-label` nor the visible Tooltip is optional.
  - `aria-disabled="true"` — use on Disabled BreadcrumbItems that should remain announced by screen readers. Use the native `disabled` attribute only if the item should be removed from the tab order entirely.
  - `aria-expanded` — required on the OverflowButton; reflects whether the overflow Popover is open (`"true"`) or closed (`"false"`).
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** BreadcrumbItem and CurrentItem text colors must meet 4.5:1 against their background at all states. `--gnrc-color-foreground-neutral-primary` on a transparent/surface background meets this criterion. Separator (`--gnrc-color-foreground-neutral-tertiary`) is decorative and exempt from 1.4.3, but verify it does not carry meaning that depends on its color.
  - **1.4.11 — Non-text Contrast:** The focus ring (dual-outline) and any icon used as a navigation affordance must meet 3:1 against adjacent colors. The dual-outline focus ring pattern satisfies this by design.
  - **2.1.1 — Keyboard:** All BreadcrumbItems and the OverflowButton must be activatable by keyboard (Enter or Space). CurrentItem and Separator are not interactive and require no keyboard handling.
  - **2.4.7 — Focus Visible:** Focus ring must be visible on all non-disabled, focusable elements (BreadcrumbItem, OverflowButton). Use the system focus ring instance delegated from Button.
  - **2.4.8 — Location:** Breadcrumb fulfills this criterion directly — it communicates the user's location in the site hierarchy as a persistent, visible trail.
  - **2.5.8 — Target Size (Minimum, AA):** BreadcrumbItem minimum interactive target is 24×24px. Small size (25px row height) meets the minimum; Medium (32px) and Large (38px) exceed it.
  - **4.1.2 — Name, Role, Value:** Each BreadcrumbItem must have an accessible name (its visible label text). The OverflowButton must have an `aria-label`. The CurrentItem must have `aria-current="page"`.
- **Screen reader:** The `<nav aria-label="Breadcrumb">` landmark is announced when the user navigates to it. Each `<li>` is announced as a list item with position (e.g. "1 of 4"). BreadcrumbItem links announce their label and role ("link"). CurrentItem announces its label and `aria-current="page"` state (typically "current page" in English locales). The OverflowButton announces its `aria-label` and role ("button"). Separator icons must be hidden from the accessibility tree (`aria-hidden="true"`) — they are visual-only and must not be announced.

---

## Usage

Implementation-time considerations that cannot be solved at build.

- **Separator must be hidden from the accessibility tree.** Set `aria-hidden="true"` on every separator icon element. Separators are purely decorative — screen readers already announce list item position, so announcing chevron icons creates redundant, confusing output.
- **Zoom:** At 200% zoom, the breadcrumb trail may overflow its container horizontally. Ensure the container supports horizontal scrolling or the Collapsed overflow variant is applied automatically. At 400% zoom, very long item labels may wrap — test that `<li>` wrapping does not break the visual or semantic sequence of the trail.
- **Reduced motion:** See `interaction.md` § Animation — Breadcrumb delegates reduced-motion behavior to Button and Popover.
- **Landmark uniqueness:** If the page has multiple `<nav>` elements (e.g. primary nav, breadcrumb, pagination), each must have a distinct `aria-label` so screen reader users can distinguish landmarks in the landmark list. `aria-label="Breadcrumb"` satisfies this for the breadcrumb region.
- **OverflowButton focus lifecycle:** The OverflowButton opens a Popover. Move focus to the first item in the Popover on open; return focus to the OverflowButton on dismiss (Escape, click outside, or Tab out). See `interaction.md` for the full keyboard lifecycle.
- **Combinations — nested navigation landmarks:** Do not nest Breadcrumb inside another `<nav>` element. Nested landmarks of the same type create an ambiguous landmark hierarchy that is difficult to navigate by screen reader.
