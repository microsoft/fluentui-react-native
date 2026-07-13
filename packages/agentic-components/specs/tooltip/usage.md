---
component: Tooltip
---

# Tooltip Usage

## When to Use

- To label icon-only buttons where the icon alone does not fully communicate the action.
- To surface the full text of a truncated string on hover.
- To provide supplementary metadata or shortcut hints for an already-labeled control.
- When the description is short (a few words to one sentence) and non-critical.

### When NOT to Use

- Never place content inside a Tooltip that is required to complete a task — users on touch devices and keyboard-only users may never see it.
- Do not use Tooltip for error messages, confirmations, or any actionable prompt — use a Callout or Dialog instead.
- Do not use Tooltip on non-interactive elements; a tooltip must be associated with an element the user can focus.

---

## Behavior

- **Never place required information inside a Tooltip.** If the user must see the content to complete an action, it belongs in a visible label or inline message.
- **Never place interactive elements inside a Tooltip.** Tooltips are purely descriptive and must not contain links, buttons, or any focusable content.

---

## Layout

- **Always prefer Above positioning as the default.**

| Value     | When to Use                                                                           |
| --------- | ------------------------------------------------------------------------------------- |
| **Above** | Default. Use when there is sufficient space above the trigger.                        |
| **Below** | When the trigger is near the top of the viewport or above-placement would be clipped. |
| **Left**  | When horizontal space is available and vertical placement is constrained.             |
| **Right** | When horizontal space is available and vertical placement is constrained.             |
