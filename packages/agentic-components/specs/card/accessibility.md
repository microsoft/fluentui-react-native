---
component: Card
platform: react-native (Windows, macOS)
---

# Card Accessibility (React Native — Windows & macOS)

## Traits

`grouped`, `non-text-boundary`, `image-content` — always.
`interactive`, `labeled`, `navigational` — when the card is clickable (a single activation/navigation target).
`stateful` — when the card is **selectable** (exposes a Selected state).

_(Determined from component anatomy, variants, and states via `flex-system:accessibility` § Trait definitions. Drives the WCAG criteria below.)_

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:**
  - **Static card** — use a generic grouping container. If the card has a heading/title, expose it as a `region` / `group` labeled by that title (`aria-labelledby`); otherwise a plain `<div>` with no role is correct. Do **not** add an interactive role to a static card.
  - **Interactive card** — the surface must be a single native control: wrap the surface in an `<a href>` when it navigates (preferred — it is a link), or a `<button>` when it performs an in-page action. Prefer native HTML over `role="link"`/`role="button"` so activation and disabled semantics come for free (see `interaction.md` for key bindings). Nested Buttons must **not** be descendants of the same `<a>`/`<button>` (no interactive nesting) — render the card-level target as a sibling overlay or use a non-wrapping click pattern so the nested controls stay independently operable.
- **Required attributes:**

| Attribute | Required when |
|-----------|--------------|
| `aria-labelledby` | The card is a labeled region/group or an interactive card — point it at the visible title so the accessible name comes from the title, not the icon. |
| `aria-label` | An interactive card has **no** visible title text — describe the destination/action ("Open Q3 report"), never the icon. |
| `aria-selected` / `aria-pressed` | A **selectable** card exposes its Selected state — `aria-selected` inside a grid/listbox-style selection set, `aria-pressed` for a standalone toggle. Selection must not be conveyed by fill/stroke color alone. |
| `alt` / `aria-hidden` | Content media — informative images get `alt`; decorative media gets `alt=""` / `aria-hidden="true"` (see WCAG 1.1.1 below). |

- **WCAG (from `flex-system:accessibility` matrix):**

| Criterion | Requirement |
|-----------|-------------|
| 1.4.3 — Contrast (Minimum) | All slot text/icons ≥4.5:1 (≥3:1 large). Verify against the **actual** surface behind the translucent fill, not a fixed white assumption — the translucent surface fill is partially opaque. |
| 1.4.11 — Non-text Contrast | The card boundary stroke conveys the grouping extent and must meet 3:1 against the surrounding surface in all non-disabled states. Because the card relies on the stroke (not a shadow) for its boundary, this is load-bearing. |
| 1.3.1 — Info and Relationships | The grouping must be programmatically determinable — title associated with the card region, Header/Content/Footer relationships exposed in the accessibility tree, not implied by layout alone. |
| 1.3.2 — Meaningful Sequence | DOM order must match visual order (Header → Content → Footer; leading → trailing for Direction=Horizontal). Do not reorder visually with CSS in a way that breaks reading order. |
| 1.1.1 — Non-text Content | Content media that conveys information needs `alt`; decorative media is hidden (`alt=""` / `aria-hidden`). File/avatar icons inside the Header are decorative alongside the visible title and get `aria-hidden="true"`. |
| 1.4.10 — Reflow | At 320 px (400% zoom) content reflows to one column with no horizontal scroll. **Direction=Horizontal must collapse to a single stacked column.** |
| 2.1.1 — Keyboard *(interactive)* | The card target is fully operable by keyboard (Enter for link, Space for button); no keyboard trap; nested Buttons remain independently operable. |
| 2.4.7 — Focus Visible *(interactive)* | The surface shows the system dual-outline focus ring (inherits the surface radius) in all non-disabled states — see `flex-system:styling`. |
| 2.5.8 — Target Size (Minimum) *(interactive)* | The card target is ≥24×24px (trivially met by the surface). Nested action buttons must each independently meet 24×24px and must not overlap the card target or each other. |
| 3.3.2 — Labels or Instructions *(interactive + labeled)* | An interactive card has a programmatically determinable name — from the visible title (`aria-labelledby`) or `aria-label` when title-less. |
| 2.5.3 — Label in Name *(labeled)* | When the card has a visible title, the accessible name must contain that visible text so voice-control users can speak it. |
| 1.4.12 — Text Spacing *(labeled)* | Title/metadata must not clip or overlap when users override text spacing; the content-driven card height accommodates this — do not pin the card to a fixed height. |
| 2.4.4 — Link Purpose (In Context) *(navigational)* | A navigating card's purpose must be clear from its title (plus context). A title-less navigating card needs an `aria-label` that names the destination. |
| 2.4.1 — Bypass Blocks *(navigational, grouped)* | In a long feed/grid of cards, provide heading structure or landmarks so screen-reader users can move by region/heading rather than tabbing through every card. |
| 1.4.1 — Use of Color *(stateful)* | The Selected state must not rely on the soft fill / soft stroke color alone — pair it with a programmatic state (`aria-selected`/`aria-pressed`) and, ideally, a non-color indicator (checkmark, border weight change perceivable without color). |
| 4.1.2 — Name, Role, Value *(stateful)* | A selectable card's name, role, and Selected value must be programmatically exposed and updated in real time as selection changes. |

- **Screen reader:** A static card announces as a group/region with its title as the name, then its content in reading order. An interactive card announces the title as a link or button ("Open Q3 report, link"); a selectable card additionally announces its Selected state ("selected" / "not selected"). Nested action buttons announce as their own buttons after the card. Decorative file/avatar icons are silent (`aria-hidden`).

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Nested interactives (most important):** Never wrap the entire card in an `<a>`/`<button>` that contains the nested action Buttons — that produces invalid interactive nesting and "the button also triggers the card" bugs. Use a click-overlay or a single titled link with the action buttons as siblings, so each control is independently reachable and operable. Reference `flex-system:accessibility` → Keyboard accessibility → focus management.
- **Zoom / Reflow:** Direction=Horizontal must stack to a single column at 400% zoom; verify media + text reflow without horizontal scroll. Reference `flex-system:accessibility` § Reflow.
- **Reduced motion:** see the reduced-motion blockquote in `interaction.md` (interactive hover/lift transitions are suppressed; a color-only change may remain but instant).
- **Typography overflow:** Long titles should wrap, or truncate with the full text available via tooltip/`title` on hover **and** focus. Never truncate the title without an access path. Reference `flex-system:accessibility` § Typography overflow.
- **Voice access:** A clickable card's spoken command is its visible title; keep the accessible name equal to (or starting with) the visible title. A title-less clickable card is voice-opaque unless its `aria-label` matches a visible cue. Reference `flex-system:accessibility` § Voice access.
- **Contrast over variable backgrounds:** The translucent surface means card contrast depends on what is behind it. Re-verify slot text and the boundary stroke against the real backdrop wherever cards are placed on imagery or tinted surfaces.
- **Control selection:** Use a Card when grouping a repeatable unit of content; use a Link or Button (not a whole clickable card) when the affordance is a single action with no surrounding content to group. Reference `flex-system:accessibility` § Control.
