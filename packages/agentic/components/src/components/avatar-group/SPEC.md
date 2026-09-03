---
name: avatar-group
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# AvatarGroup

## Scope

AvatarGroup is a non-interactive layout row that presents several Avatar children as one cohort and optionally appends a trailing `+N` indicator for members that are not shown. It positions the children it is given and resolves the group's own geometry from a declared size. It does not fetch members, sort them, decide how many are visible, own presence or activity status, add press or focus behavior, or restyle the Avatar children it renders.

## Public contract

`layout` defaults to `spread` and accepts `spread` or `stack`. `size` defaults to `40` and accepts `16`, `20`, `24`, `28`, `32`, `40`, `56`, or `120`. `overflowCount` defaults to `0`. `children` holds the visible Avatar elements. `root` is required, and `overflow` is an optional slot for the trailing indicator container.

`spread` separates the items with a size-scaled gap so every circle is fully visible. `stack` overlaps the items by a size-scaled negative leading offset and centers each item inside a circular box filled with the group's surface colour, so the surrounding ring paints the separation gap that keeps each face distinct. Later items paint over earlier items in both layouts, so the trailing item is in front.

`size` governs only the group's own geometry: the spread gap, the stack overlap, the stack separation-ring width, the item box, and the indicator's diameter, border, and text scale. AvatarGroup never rewrites a child's props, so each Avatar keeps whatever `size` the caller gave it; a development warning reports a child whose explicit `size` disagrees with the group.

The indicator renders after the children whenever `overflowCount` is `1` or more, except at size `16`, where the glyph cannot be read and the indicator is suppressed with a development warning. Its text is `+N` and saturates at `+99`; exact totals above that belong in the group's accessible name. Five rendered items is the design maximum. Exceeding it is accepted rather than truncated, and reported with a development warning.

The resolved state retains layout, size, overflow count, indicator text, the item and item-offset styles, theme state, and the user root style. User style is applied after component styles. AvatarGroup owns no interaction state.

### Requirements

- **AVG-001:** Resolve the layout axis and apply the per-size spread gap, the stack overlap, and the stack separation ring, keeping trailing items in front.
- **AVG-002:** Resolve the declared size for group geometry only, leave child props untouched, and warn in development when a child's explicit size disagrees.
- **AVG-003:** Render the trailing indicator only when the hidden count is positive, format its text as `+N` saturated at `+99`, and suppress it at size `16` with a development warning.
- **AVG-004:** Expose a labelled group as one accessible image node, leave an unlabelled group as a transparent layout row whose children announce themselves, and keep the indicator decorative until it is given its own label.
- **AVG-005:** Add no press, hover, focus, disabled, selected, or motion behaviour, forward the broad root `ViewProps` surface, and retain the user root style after component styles.
- **AVG-006:** Treat five rendered items as the advisory design maximum and warn in development rather than dropping caller content.

## Platform behavior

A group with `accessibilityLabel` is accessible with `role="img"`, so Windows exposes it as a UI Automation image and macOS as an AX image, and the cohort announces once instead of one node per member. Without a label the root carries `role="none"` and stays a plain layout row, so each Avatar child announces its own accessible name in source order. Callers can still set `accessible` and the ARIA-aligned `role` explicitly.

React Native paints later siblings above earlier ones on both target platforms, so stack order needs no explicit `zIndex`. The stack separation ring is an ordinary filled circular box rather than a border, an outline, or a mask, so toggling layout never creates a border visual after mount. AvatarGroup adds no tab stop and renders no `FocusVisual`.

## Divergences from Flex

- `avatar-group-size-declared-on-group` — **accepted.** The source delegates size entirely to the Avatar children. React Native has no sibling-relative sizing, so the group must know the size to resolve its gap, overlap, ring width, and indicator. FURN declares `size` on the group for geometry only, leaves each child's own size untouched, and warns in development when the two disagree.
- `avatar-group-stack-separation-ring` — **accepted.** The source specifies a masked circular cut-out with a painted outside-stroke fallback. React Native has no mask compositing, so FURN adopts the fallback: each stacked item is centred in a `color.surfaceNeutralNearer` circular box whose annulus paints the separation gap. A stacked group should therefore sit on that surface.
- `avatar-group-overflow-not-an-avatar` — **accepted.** The source builds the indicator from an Avatar in initials mode. FURN's Avatar normalises initials to at most two characters, so `+99` cannot survive that path. FURN renders the indicator from its own view and text slots and binds the equivalent Avatar tokens directly.
- `avatar-group-slot-maximum-advisory` — **accepted.** The source states a hard five-slot maximum. FURN treats it as advisory: a layout container that silently dropped caller content would be harder to diagnose than a development warning.
- `avatar-group-labeled-group-role` — **accepted.** A labelled FURN group uses `role="img"`, which matches the source's collapsed single-image pattern, and an unlabelled group stays a transparent row so individual identities are still announced.

## Conformance

| Requirement | Evidence                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| AVG-001     | `avatar-group.styles.ts`, `useAvatarGroupStyles.ts`, `renderAvatarGroup.tsx`, `avatar-group.test.tsx`   |
| AVG-002     | `avatar-group.types.ts`, `useAvatarGroup.ts`, `avatar-group.test.tsx`, `avatar-group.types.test.ts`     |
| AVG-003     | `useAvatarGroup.ts`, `avatar-group.styles.ts`, `avatar-group.test.tsx`                                  |
| AVG-004     | `useAvatarGroup.ts`, `useAvatarGroupStyles.ts`, `avatar-group.test.tsx`                                 |
| AVG-005     | `avatar-group.types.ts`, `useAvatarGroupStyles.ts`, `avatar-group.stories.tsx`, `avatar-group.test.tsx` |
| AVG-006     | `useAvatarGroup.ts`, `avatar-group.test.tsx`                                                            |
