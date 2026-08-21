---
component: Textarea
---

# Textarea Usage

## When to Use

- To collect multi-line, free-form text: comments, descriptions, messages, notes, or any content that may span more than one line.
- As the text entry surface inside a Field component for labeled, validated form fields that expect longer input.
- In composition interfaces where the user needs space to draft content — e.g., feedback forms, support tickets, or chat message composers.

### vs Input

Input is for short, single-line text — names, email addresses, search queries. Textarea is for multi-line, free-form content where the user may need to write more than one line. If the expected input could exceed one line, use Textarea. If the expected input is always a single short value, use Input.

### vs Field

Textarea is the bare multi-line text entry control. Field is the container that wraps Textarea (or Input) with a label, helper text, info button, and validation message. Use Textarea alone only when external context provides the label and error handling. Use Field in all standard form layouts.

---

## Behavior

- **Focus means active editing state.** In this component, Focus represents the clicked-in or keyboard-focused state where the caret is active and the user can type. Implementation maps this state to DOM focus.
- **Never use Disabled to represent Read only.** Disabled means the control is unavailable and should not be interacted with. Read only means the value is visible and selectable but not editable. They serve different purposes and use different foreground tokens — Disabled uses `neutral-disabled` (low contrast), Read only uses `neutral-primary` (full contrast).
- **Always synchronize the visual Error state with the underlying validation signal.** A red border without a programmatic error signal is invisible to assistive technology; the validation signal without the visual state confuses sighted users. Both must change together.
- **Placeholder text is not a label.** Placeholder text disappears on input and is unreliably surfaced by assistive technology. Always provide a persistent label via Field or an equivalent platform-appropriate accessible name.
- **Choose the Resize variant based on layout constraints.** Vertical (default) is safe in most form layouts because it doesn't break the parent container's column width. Use None when consistent height is required — e.g., in a fixed-height card. Use Both only when horizontal expansion is meaningful and the layout can accommodate it.
- **Set a reasonable min-height that matches the expected content length.** A feedback form expecting a sentence or two can use the default min-height. A composition field expecting paragraphs should increase min-height so the empty state doesn't look undersized relative to the expected input.

---

## Layout

- **Textarea fills the width of its container.** Do not constrain Textarea to a fixed pixel width unless the content type demands it. Let the parent container determine width.
- **Vertical resize is safe for most layouts.** It allows the user to expand the field without breaking horizontal layout constraints. Avoid Both unless the parent layout explicitly supports horizontal growth.

---

## Content

- **Placeholder text should describe the expected content or provide a brief example** — e.g., "Describe the issue...", "Write your message here...". Keep it short; placeholder text serves as a hint, not instructions.
- **Do not repeat the label in the placeholder.** If the Field label says "Description", the placeholder should not also say "Description" — use "Provide additional details..." instead.
- **Use sentence case for placeholder text.** No trailing punctuation unless the placeholder is a complete sentence (which it generally should not be).
