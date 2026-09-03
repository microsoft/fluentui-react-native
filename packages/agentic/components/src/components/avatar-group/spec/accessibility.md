# AvatarGroup accessibility

Give the group an accessible name when the cohort should announce once. The root then becomes accessible with `role="img"`, and the label should name the cohort and its total membership rather than the visible count, for example `Document collaborators: 8 people`. Windows maps that root to a UI Automation image and macOS maps it to an AX image.

Leave `accessibilityLabel` off when each member matters on its own. The root then carries `role="none"`, stays out of the accessibility tree as a control, and every Avatar child announces its own name in source order. Do not put the total count on both the group and its children; pick one place for it. Callers can still set `accessible` and the ARIA-aligned `role` explicitly when a surface needs different semantics.

The overflow indicator is decorative by default because `+5` announced as text loses its meaning. Give the `overflow` slot its own accessible name, such as `accessibilityLabel="5 more"`, when the group is unlabelled and the hidden count must still be heard; the indicator then becomes accessible with `role="img"`. At size `16` the indicator is never rendered, so the hidden count has to live in the group's own label.

AvatarGroup is not a control. It takes no focus, exposes no state, and adds no live region. When membership changes, the surrounding surface owns the announcement.
