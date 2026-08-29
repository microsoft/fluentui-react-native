---
name: skeleton
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Skeleton

## Scope

Skeleton is a non-interactive placeholder surface built on a React Native
`View`. It fills the space of one block of content that has not arrived yet and
plays a looping highlight sweep while it is mounted. The caller gives the
placeholder its size and corner radius through `style`, so a single component
covers text lines, avatars, thumbnails, and card blocks.

Skeleton is not a progress indicator, a container, or a loading state manager.
It has no variants, no interaction states, no children, and no timing logic
tied to data. It never announces loading by itself: the surrounding region owns
that semantic. Composing several placeholders into a loading silhouette is the
caller's layout work.

## Public contract

### Props and defaults

Skeleton takes React Native `ViewProps` minus `children`. It owns no variant
props of its own.

| Prop              | Type                                 | Default | Contract                                                                                                                               |
| ----------------- | ------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `style`           | `StyleProp<ViewStyle>`               | none    | Sizes and reshapes the placeholder. Applied after the component's own root styles, so height, width, and `borderRadius` overrides win. |
| `onLayout`        | `(event: LayoutChangeEvent) => void` | none    | Called before the component records the measured rectangle. The component keeps measuring even when a caller supplies this handler.    |
| other `ViewProps` | —                                    | —       | Forwarded to the root, including `testID`. `children` is rejected at the type level.                                                   |

The component writes its hidden accessibility props after spreading the broad
root prop surface, so caller values for those props are accepted by the type
but ignored at runtime.

**SKEL-001:** Accept owned root `ViewProps` without `children`, forward them to
the root `View`, and apply the caller's `style` after the component's resolved
root styles.

### Slots and anatomy

| Slot   | Required | Contract                                                                    |
| ------ | -------- | --------------------------------------------------------------------------- |
| `root` | yes      | The placeholder surface. Clips its content and hosts the highlight overlay. |

The root renders at most one child: an animated overlay that carries the
highlight band. The overlay is mounted only while the sweep can run, is
identified by the `skeleton-shimmer` test id, and takes no pointer input. When
the sweep cannot run the root renders no children at all.

**SKEL-002:** Render the root with the highlight overlay as its only child,
mounted solely while the sweep is active and excluded from pointer input.

### State ownership

Skeleton owns exactly two pieces of internal state: the measured root rectangle
and the animation clock driving the sweep. Both are derived, not configurable.
There is no checked, selected, pressed, hovered, focused, or disabled state,
and no controlled or uncontrolled value. The caller owns when the placeholder
is mounted and unmounted.

**SKEL-003:** Derive the sweep from the measured root rectangle, forward the
caller's `onLayout` first, and run the sweep only once the measured width and
height are both greater than zero.

**SKEL-004:** Bind the root fill and radius plus the highlight fill to theme
tokens, clip the root, and keep the caller's `style` as the last layer.

**SKEL-005:** Suppress the sweep and unmount the overlay while the operating
system reduced-motion setting is on, with no substitute animation.

**SKEL-006:** Size the highlight band relative to the measured width with a
fixed floor and translate it across the full root width on a continuous linear
loop.

## Platform behavior

Windows and macOS behave identically. The root is hidden from accessibility
and has no tab stop by default, but the broad `ViewProps` surface permits a
caller to set `focusable`. It retains the default React Native pointer
behavior; only the highlight overlay disables pointer input.

The sweep uses the native driver, so it continues on the platform's animation
thread rather than the JavaScript thread. The reduced-motion source is the
platform accessibility setting reported by React Native; when it turns on while
a placeholder is mounted, the running loop is stopped and the clock is reset.
Because the sweep depends on measurement, a placeholder that is never laid out
with a positive width and height stays static.

No intrinsic size is applied. A placeholder with no `style` collapses to zero
height, which is the caller's responsibility to avoid.

## Divergences from Flex

| ID                                | Disposition    | React Native contract                                                                                                                                                                                                                  | Follow-up                                                                                      |
| --------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `skeleton-highlight-band-fill`    | Accepted       | FURN paints the sweep as a translating opaque band view held at a fixed opacity. Flex describes a gradient highlight that fades in and out across the bar.                                                                             | Revisit only if this package takes a gradient dependency.                                      |
| `skeleton-instance-timeline`      | Deferred       | Each placeholder starts its own loop from its own first measurement, so placeholders in one group are not phase locked. Flex requires a single shared timeline across a group.                                                         | Needs a shared clock or group provider; that is a new public surface and is out of scope here. |
| `skeleton-container-busy-state`   | Not applicable | The root is removed from the accessibility tree and exposes no busy state. Flex assigns the busy semantic to the container that owns the loading region, which in FURN is caller-owned composition rather than part of this component. | None.                                                                                          |
| `skeleton-pointer-events`         | Deferred       | The root retains the default React Native pointer behavior and can intercept input when placed over interactive content.                                                                                                               | Default the root to `pointerEvents="none"` while preserving an explicit caller override.       |
| `skeleton-focusable-prop-surface` | Deferred       | The root type forwards `focusable` even though the component is hidden from accessibility and supplies no focus visual or action.                                                                                                      | Omit or override `focusable` in a separately reviewed native-prop correction.                  |

## Conformance

| Requirement | Evidence                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| SKEL-001    | `skeleton.types.ts`, `useSkeleton.ts`, `skeleton.types.test.ts`, `skeleton.test.tsx`                      |
| SKEL-002    | `renderSkeleton.tsx`, `skeleton.test.tsx`                                                                 |
| SKEL-003    | `useSkeleton.ts`, `skeleton.test.tsx`                                                                     |
| SKEL-004    | `skeleton.styles.ts`, `useSkeletonStyles.ts`, `__snapshots__/skeleton.test.tsx.snap`, `skeleton.test.tsx` |
| SKEL-005    | `useSkeleton.ts`, `renderSkeleton.tsx`, `skeleton.test.tsx`                                               |
| SKEL-006    | `useSkeleton.ts`, `renderSkeleton.tsx`, `skeleton.stories.tsx`                                            |
