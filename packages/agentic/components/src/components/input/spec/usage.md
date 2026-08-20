---
component: Input
---

# Input Usage

## When to Use

- To collect short, single-line text data: names, email addresses, search queries, URLs.
- As the text entry surface inside a Field component for labeled, validated form fields.
- In toolbars or command bars for inline search or filter patterns.

### vs Textarea

Input is for short, single-line text. Textarea is for multi-line, free-form content — descriptions, comments, or any context where the user may need to write more than one line. If the expected input could exceed one line, use Textarea.

### vs Field

Input is the bare text entry control. Field is the container that wraps Input with a label, helper text, info button, and validation message. Use Input alone only when external context provides the label and error handling. Use Field in all standard form layouts.

---

## Behavior

- **Never use Disabled to represent Read only.** Disabled means the control is unavailable and should not be interacted with. Read only means the value is visible and selectable but not editable. They serve different purposes and use different foreground tokens — Disabled uses `neutral-disabled` (low contrast), Read only uses `neutral-primary` (full contrast).
- **Always synchronize the visual Error state with the underlying validation signal.** A red border without a programmatic error signal is invisible to assistive technology; the validation signal without the visual state confuses sighted users. Both must change together.
- **Placeholder text is not a label.** Placeholder text disappears on input and is unreliably surfaced by assistive technology. Always provide a persistent label via Field or an equivalent platform-appropriate accessible name.
- **Icon End slots are for status or action affordances.** Common patterns: a clear button (dismiss icon), a visibility toggle (eye icon for password fields), or a validation indicator. Do not use trailing icons for decorative purposes.

---

## Layout

- **Input fills the width of its container.** Do not constrain Input to a fixed pixel width unless the content type demands it (e.g., a 4-digit PIN input). Let the parent container determine width.
- **Size should match adjacent interactive components.** When placing Input next to a Button in a search bar, use the same Size value for both to maintain vertical alignment.
- **Use Small in dense contexts only.** Small meets the 24px minimum target size but leaves no room for error. Prefer Medium as the default.

---

## Content

- **Placeholder text should describe the expected input format or provide an example** — e.g., "Search files...", "name@example.com". Keep it short; placeholder text is truncated when the input is narrow.
- **Do not repeat the label in the placeholder.** If the Field label says "Email address", the placeholder should not also say "Email address" — use "name@example.com" instead.
- **Use sentence case for placeholder text.** No trailing punctuation unless the placeholder is a complete sentence (which it generally should not be).
