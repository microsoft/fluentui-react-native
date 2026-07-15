---
component: Spinner
---

# Spinner Usage

## When to Use

- To communicate that a short, indeterminate operation is in progress (loading data, submitting a form, waiting on a network call) when the layout of the result is not known in advance.
- To occupy a region too small to mimic incoming content structure — a button label slot, an icon position, a single-line cell.
- To pair with a busy/loading-region status announcement as the visual half of the signal, when no structural placeholder is meaningful. (See `accessibility.md` for the ARIA mechanism.)

### When NOT to Use

- Do not use Spinner when the incoming content's layout is known — Skeleton communicates more by mimicking the layout, while Spinner only says "something is happening."
- Do not use Spinner for measurable progress — use a ProgressBar when the task has a known percentage (upload, install, multi-step flow).
- Do not use Spinner for indefinite background processes the user is not actively waiting on — the rotating indicator implies imminent completion. Use a passive status indicator instead.
- Do not use Spinner for sub-second operations — the flash of indicator is more disruptive than the brief blank.

### vs Skeleton

Skeleton communicates **what is about to appear** by approximating the layout of the incoming content. Spinner communicates only that **something is happening**, with no structural information. Reach for Skeleton when the layout is known and meaningful; reach for Spinner when the layout is unknown or the region is too small to mimic structure (one icon, one button label, a single cell).

### vs ProgressBar

ProgressBar communicates **how much of a known task is complete**. Spinner communicates **that an indeterminate task is in progress**. Use ProgressBar when you have a measurable percentage (upload, install, multi-step flow); use Spinner when you do not.

---

## Behavior

- **Show the spinner only for the duration of the wait.** Do not pre-emptively render the spinner before the operation starts or leave it visible after the operation ends. The spinner is a present-tense signal; stale rotations train users to ignore it.
- **Replace the spinner with content directly, without a fade or transition.** The swap is an instant substitution at the moment the data arrives. Animated fades extend the perceived load time without adding information.
- **Synchronize multiple spinners within a single group.** When several spinners appear together (a list of items each loading), their cycles must share a timeline. Staggered cycles read as unintended noise rather than as a coordinated loading state.
- **Do not block interaction outside the spinner's region.** A spinner signals that one region is loading; the rest of the page should remain interactive. If the entire page is unusable until load completes, use a full-screen blocking pattern (modal with spinner, full-page progress) and communicate that explicitly rather than implying it with a single in-line spinner.
- **Pair longer waits with status text.** Beyond ~5 seconds the spinner alone communicates only that the wait continues, not what is happening. Add a short status string ("Loading messages…", "Saving changes…") adjacent to the spinner to set user expectations.

---

## Layout

- **Match Spinner size to its host control.** Use X-Tiny / Tiny / X-Small alongside inline text or small controls; Small / Medium when the spinner is the standalone signal in a compact region; Large / X-Large / Huge for empty-state regions, modal dialogs, or focal positions in marketing or onboarding contexts.
- **Center the Spinner in its loading region.** When the spinner occupies a region of its own (not inline), center it horizontally and vertically in the bounding box. Off-center spinners read as misaligned chrome rather than as the active signal.
- **Inline placement: Spinner leads, status text follows.** When pairing a spinner with status text on the same line, the spinner sits before the text in reading order. The eye locks on the moving element first, then reads the explanation; reversed order reads as an afterthought.
- **One spinner per loading region.** A region with multiple spinners suggests several independent loads in one box, which is rarely what is meant. If multiple loads are genuinely in flight, give each its own labeled region.
