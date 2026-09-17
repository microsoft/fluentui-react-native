# AvatarGroup usage

Use AvatarGroup when several people or entities share one context and should read as a cohort: meeting participants, comment reactors, document collaborators, assignees on a row. Use `Avatar` directly for a single identity, and use a count or summary text for memberships in the tens or hundreds, where individual faces stop being scannable.

Choose `spread` when each face has to read on its own, which suits small counts, comment headers, and reaction rows. Choose `stack` when the count is the message and horizontal space is tight, such as list rows, table cells, and headers. A stacked group paints its separation gaps in `color.surfaceNeutralNearer`, so place it on that surface.

Set `size` on the group and give every child Avatar the same size. The group uses its own value only for spacing and for the overflow indicator, so a mismatch shows up as uneven geometry; development builds warn about it. Sizes `28` through `56` suit most groups. Size `16` never renders the indicator, so put the hidden count in the group's accessible name instead. Size `120` is accepted but reads as several separate portraits rather than a cohort.

Keep the rendered items at five or fewer, counting the indicator, and move the remainder into `overflowCount`. Set `overflowCount` to the number of hidden members rather than the total, so a group of eight showing four members uses `overflowCount={4}`.

Do not pad inside the group; spacing around it belongs to the containing surface. Do not nest one group inside another, do not mix sizes, and do not attach press handlers to individual children. When the whole roster should be actionable, wrap the group in a single interactive control and let that control own hover, pressed, focus, and target sizing.
