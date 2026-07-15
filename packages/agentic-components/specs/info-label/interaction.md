---
component: InfoLabel
platform: react-native (Windows, macOS)
---

# InfoLabel Interaction (React Native — Windows & macOS)

## Keyboard navigation

InfoLabel is a composition — keyboard handling is owned by its parts, not by the InfoLabel root.

- **Tab / Shift+Tab** — moves focus to and from the trigger Button. The Label itself is not a tab stop (it is a native `<label>` element); clicking it forwards focus to the associated form control per platform default, identical to plain Label.
- **Enter / Space** (on the trigger) — opens the Popover and sets `aria-expanded="true"` on the trigger. If the Popover is already open, the same keys toggle it closed and focus stays on the trigger.
- **Escape** (while the Popover is open) — closes the Popover and returns focus to the trigger. Owned by Popover — see `flex-components:popover` → `interaction.md`.
- **Tab / Shift+Tab** (while the Popover is open) — cycles focus through any focusable elements inside the Popover (links, buttons). Owned by Popover.
- No arrow-key navigation on the trigger — it is a single focusable Button, not a composite widget.

## Focus management

- The Label never carries focus and never displays the focus ring. It is non-interactive scaffolding — see `flex-components:label` → `interaction.md`.
- The trigger Button is the only tab stop InfoLabel introduces. It uses the universal dual-outline focus ring — see `flex-system:styling`.
- On Popover open: focus moves to the first focusable element inside the Popover, or to the Popover container itself if no focusable children exist. Owned by Popover.
- On Popover dismiss (Escape, light dismiss, or explicit close action): focus returns to the trigger Button. Losing focus on close would be a keyboard accessibility failure.
- When the Popover is closed, its content must not be reachable via keyboard or assistive technology — no invisible tab stops in the document.
- When `State=Disabled`, the trigger Button is removed from the tab order per Button's Disabled state.

## Open / close

The Open variant axis in `tokens.yaml` is the design-time representation of the Popover's runtime visibility. The mapping between user actions and Open transitions is owned by the trigger Button and the Popover, in combination:

| Trigger                                                                         | Behavior                                                                                               |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Click on trigger                                                                | Toggles Open — opens if closed, closes if already open. Trigger's `aria-expanded` updates accordingly. |
| Enter / Space on trigger                                                        | Same as click.                                                                                         |
| Click outside the Popover (light dismiss)                                       | Closes the Popover; focus returns to the trigger. Owned by Popover.                                    |
| `Escape` key while Popover is open                                              | Closes the Popover; focus returns to the trigger. Owned by Popover.                                    |
| Explicit close action inside the Popover (e.g. a "Close" button in the content) | Closes the Popover; focus returns to the trigger.                                                      |
| Activating a different InfoLabel's trigger on the same surface                  | Closes the prior Popover before opening the new one — see Behavior in `usage.md`.                      |

## Animation

InfoLabel does not introduce its own animation. Each part follows its child component's motion guidance:

- **Label foreground transition (Rest ↔ Disabled):** Matches the associated control's foreground transition — ≤150ms ease-in-out per `flex-components:label` → `interaction.md`.
- **Trigger Button state transitions (Rest ↔ Hover ↔ Pressed ↔ Focus ↔ Disabled):** platform-driven color transitions, ≤150ms per `flex-components:button` → `interaction.md`.
- **Popover entry / exit:** Fast fade-in with subtle scale (≤150ms, ease-out) on open; near-instant fade-out on close. Owned by `flex-components:popover` → `interaction.md`.

> **Reduced motion:** When the OS reduce-motion setting is set, every transition above resolves to instant — Label foreground swap is instant, Button state changes are instant, Popover appears and disappears without fade or scale. This matches the reduced-motion guidance in all three child component skills and the `motion` block in `tokens.yaml`.
