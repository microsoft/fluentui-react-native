---
component: Switch
---

# Switch Usage

## When to Use

- Binary settings that take effect immediately on toggle (e.g. enable notifications, dark mode)
- Feature toggles where the user expects instant feedback without a submit step
- Replacing physical on/off metaphors in digital settings surfaces

### vs Checkbox

Checkbox supports an indeterminate state and deferred submission (the change only applies when the user submits a form). Switch has no indeterminate state and triggers an immediate change on activation. Use Checkbox in forms with a submit step; use Switch when the toggle effect is instant.

---

## Behavior

- Always provide a visible label or an equivalent accessible name — a standalone switch with no identification is inaccessible.
- Never use a switch for actions that require a submit step — use Checkbox inside a form instead.
- Never use a switch for more than two states — if you need an indeterminate state, use Checkbox.
- Never nest a switch inside another interactive control — it is a standalone atomic element.

---

## Layout

- Always place the switch's label on a consistent side within a settings group — mixing label positions creates scanning friction.
