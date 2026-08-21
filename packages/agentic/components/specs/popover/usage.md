---
component: Popover
---

# Popover Usage

## When to Use

- To surface contextual details, settings, or secondary actions anchored to a trigger without leaving the current view.
- When the content is structured (headings, lists, form controls, buttons) and cannot fit in a Tooltip.
- For non-blocking supplementary information that the user can dismiss at will.
- When the user needs to interact with the content (e.g., click a link, toggle a setting) before dismissing.

### vs Tooltip

Tooltip is for single-line, non-interactive plain text that labels or describes a UI element. Popover is for structured, optionally interactive content that may include headings, controls, or actions. If the user never needs to click inside the floating surface, use Tooltip.

### vs Dialog

Dialog blocks interaction with the underlying page and requires an explicit decision before dismissal. Popover is non-blocking — it can be light-dismissed at any time. Use Dialog when the user must acknowledge or act before continuing; use Popover for supplementary information.

### vs Menu

Menu provides an action list with selection semantics (single or multi-select). Popover is a generic content container with no built-in selection model. If the floating surface is a list of actions or options with selection behavior, use Menu.

### When NOT to Use

- Do not use Popover for plain-text labels or single-line descriptions — use a Tooltip instead.
- Do not use Popover to block interaction or require a decision — use a Dialog instead.
- Do not use Popover for critical information that must persist after dismissal — use an inline panel, MessageBar, or Dialog.
- Do not use Popover as a menu; use a Menu component for action lists with selection semantics.

---

## Behavior

- **Never place critical or required information in a Popover.** If the user must see the content to complete a task, it belongs in a visible inline surface or Dialog.
- **Always provide light dismiss (click-outside and a keyboard dismiss affordance).** Users must be able to dismiss the popover without hunting for a close button.
- **Never nest a Popover inside another Popover.** Nested floating surfaces create focus-management and accessibility problems.
- **Never use Popover as a replacement for Tooltip.** If the content is a single line of non-interactive plain text, Tooltip is the correct component.

---

## Layout

- **Always handle edge proximity in positioning logic.** When the popover would overflow the viewport, shift the container to stay within bounds while keeping the arrow centered on the trigger. The arrow only moves off-center as a last resort when centering is geometrically impossible.
