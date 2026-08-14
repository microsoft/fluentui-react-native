---
component: ProgressBar
---

# ProgressBar Usage

## When to Use

- To communicate the progress of a task that has a calculable completion percentage (uploads, downloads, multi-step flows). Use **Determinate**.
- To indicate that work is happening but its duration is not known. Use **Indeterminate**, and switch to Determinate as soon as a percentage becomes available.
- To represent a snapshot of a continuous value — storage capacity, quota fill, score, resource usage. Use **Static**.
- To communicate task failure (use **Error**) or successful completion (use **Success**) at the end of a Determinate or Static run.

### When NOT to Use

- **Operations that complete in under one second** — a progress bar that flashes onto the screen creates more noise than signal. Render nothing or use a Skeleton if the consumer is waiting on known-structure content.
- **Discrete-step indicators** — for sequences like "Step 2 of 4" with distinct UI for each step, use a stepper pattern, not a progress bar. ProgressBar is a single continuous value, not a stepped journey.
- **Indicating a value that may decrease over time** — ProgressBar must never appear to move backward. For values that can grow and shrink (e.g. an editable input), use a different visualization.
- **Replacing a Spinner for short async waits** — see vs Spinner below.
- **Replacing a Skeleton for content placeholders** — see vs Skeleton below.

### vs Spinner

ProgressBar communicates _how much_ progress has been made or that work has a measurable shape. Spinner communicates only _that_ work is happening. Use Spinner for short waits where progress is not measurable and the surface area is constrained (inline within a button, on a card). Use Indeterminate ProgressBar when the wait spans the width of a section or page and a horizontal indicator reads more naturally than a rotating spinner.

### vs Skeleton

ProgressBar represents the progress of a task. Skeleton represents the _shape_ of content that is about to appear — text lines, image blocks, table rows. Use Skeleton when the content has a known layout that will be replaced in place. Use ProgressBar when there is no incoming content shape, only an ongoing operation.

### vs MessageBar

ProgressBar communicates ongoing or completed state about a single task. MessageBar communicates page- or section-level feedback that may apply to the whole surface (an Error MessageBar covers a failed save; an Error ProgressBar covers a failed upload). When a task fails, the bar's Error status communicates the failure locally; pair with a MessageBar only when the failure has broader consequences than the individual task.

---

## Behavior

- **Never let the bar move backward.** Progress can stall, but it must not regress visually — a backward jump erodes confidence in the indicator. If a recalculated estimate would move the value down, hold the current value and resume from there.
- **Always prefer Determinate over Indeterminate when a percentage exists.** Indeterminate is a fallback for genuinely unknown durations, not a default. Knowing a task is 60% complete is meaningfully more useful than knowing it is "working."
- **Combine sequential sub-tasks into one continuous bar.** When a user-perceived operation is composed of several internal steps (validate → upload → process), present one bar that advances across all of them. Multiple sequential bars feel like stalls between phases.
- **Hold the completed bar briefly before dismissing.** A bar that disappears the instant it hits 100% reads as a flicker. Hold at full for ~500ms so the user perceives completion, then dismiss.
- **Replace the Value text with an error message when Status becomes Error.** Do not show "100%" next to a red bar — the value reads as a contradiction. Swap the Value text to a brief, human-readable error string ("Upload failed").
- **Static bars must not animate, including on value change.** If a Static value changes (storage usage updates), snap to the new width. Animating a Static change reframes it as a Determinate event, which it is not.

---

## Layout

- **Stretch to fill the parent container.** Do not set a fixed width on the bar — the parent layout decides the extent. Bar thickness is fixed at the component level (see the platform token file (`tokens.yaml`)).
- **Place the bar near the work it represents.** Inline within a list row for per-item progress; below a section heading for section-level progress; at the top of a page (sticky) for page-level operations like form submission.
- **The Label is required; Value text and Validation icon are optional and additive.** Always render the Label, even when surrounding context (heading, button) appears to describe the bar — the Label belongs to the component and travels with it.
- **The Label bridges a non-text-contrast gap.** The Track and Indicator are tuned for a soft, recessive visual — the contrast between page surface, unfilled Track, and filled Indicator is too low to act as the bar's only signal. The Label, which is high-contrast text, names what the bar represents and carries the affordance accessible users need. Suppressing the Label removes that bridge and is not supported.
- **Validation icon belongs in the Header, not the Bar.** Do not overlay status icons onto the Track or Indicator — the icon reads more clearly in the Header alongside the Value text.

---

## Content

- **Label text — short, clear, sentence case, no terminal punctuation.** Describe the task in two or three words ("Uploading photos", "Sync progress"). The Label is a heading, not a sentence.
- **Use -ing verbs with an ellipsis for in-progress states.** "Uploading…" reads as ongoing; "Upload" reads as a button label and is ambiguous.
- **Avoid time estimates in Value text.** "About 3 minutes remaining" goes stale instantly and erodes trust when wrong. Prefer percentage, fraction, or descriptive units ("12 of 30 files").
- **On Error, write a short, plain-language failure reason.** "Upload failed — check your connection" is better than "Upload failed (error code 503)." Use the Value text slot for this — do not stack a separate error line below the bar; pair with a MessageBar if more detail is needed.
- **Static bars use noun-form values.** "240 GB of 500 GB used" — describe the quantity, not a progress action. Static is not in motion.
