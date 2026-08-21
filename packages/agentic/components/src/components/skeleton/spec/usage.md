---
component: Skeleton
---

# Skeleton Usage

## When to Use

- To occupy space for content that takes longer than ~1s to load and whose layout is known in advance (avatar + name + subtitle, card grid, list of rows).
- To preserve page structure during data fetches so the surrounding layout does not shift when content arrives.
- To signal that a specific region is loading without blocking interaction elsewhere on the page.

### When NOT to Use

- Do not use Skeleton when the incoming content's structure is unknown — the placeholder will misrepresent what's coming. Use a Spinner or progress indicator instead.
- Do not use Skeleton for fixed chrome that is already present (app bars, navigation, tabs) — only stand in for variable content.
- Do not use Skeleton for long-running background processes — the implicit promise of "content shortly" breaks. Use a determinate progress bar or status message.
- Do not use Skeleton for content under ~1s of expected load time — the flash of placeholder is more disruptive than the brief blank.

### vs Spinner

Skeleton communicates **what is about to appear** by mimicking the layout of the incoming content. Spinner communicates only that **something is happening** with no structural information. Reach for Skeleton when the layout is known and meaningful; reach for Spinner when it isn't, or when the region is too small to mimic structure.

### vs ProgressBar

ProgressBar communicates **how much of a known task is complete**. Skeleton communicates **a placeholder for an unknown-duration content fetch**. Use ProgressBar when you have a measurable percentage (upload, install, multi-step flow); use Skeleton when you have layout but no measurable progress.

---

## Behavior

- **Keep the skeleton silhouette simple and high-level.** Approximate the layout block — avatar circle, title bar, subtitle bar — and stop. Do not render placeholder copy, fake initials, or specific shapes that may differ from the actual content. The skeleton is a silhouette, not a forgery; specific details set false expectations that the real content may not meet.
- **Synchronize skeletons within a single group.** When multiple skeletons appear together, their animation cycles must share a single timeline so the highlight band crosses every bar in unison. Staggered animations read as unintended noise rather than as a coordinated loading state.
- **Prefer simultaneous data fetches over staggered ones.** Staggered loads produce staggered skeleton-to-content swaps, which feel jittery. If a staggered load is unavoidable, hold all skeletons until the slowest finishes rather than swapping them in piecemeal.
- **Do not block interaction outside the skeleton region.** Skeletons signal that a region is loading; the rest of the page should remain interactive. If the entire page is unusable until load completes, use a different pattern (blocking spinner, full-screen progress).
- **Replace skeletons with real content directly, without a fade or transition.** The swap should be an instant substitution at the moment the data arrives. Animated fades extend the perceived load time without adding information.

---

## Layout

- **Match the dimensions of the content the Skeleton replaces.** A title-bar skeleton should be the height of the title's textstyle line-height; an avatar skeleton should be the diameter of the avatar it stands in for. Mismatched dimensions cause layout shift when content arrives, which is the exact failure mode Skeleton exists to prevent.
- **Group skeletons by content block, not by uniform rows.** A persona placeholder is a circle plus two bars (name, subtitle), not three identical bars. The placeholder should read as the shape of the content even at a glance.
- **Use Skeleton at the leaf level — one Bar per content element.** Do not draw a single large skeleton spanning multiple content blocks; granularity of the placeholder should match the granularity of the data fetch where possible.
- **Override radius on the instance to match content shape.** Override radius on the instance to match content shape. The default radius is a neutral starting point, not a rule.
