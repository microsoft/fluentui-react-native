# Skeleton usage

Use Skeleton when a region is fetching content whose shape is already known and
the wait is long enough that an empty gap would read as breakage. Give each
placeholder the size of the block it stands in for so the layout does not shift
when the real content arrives.

Reach for Spinner instead when the incoming layout is unknown or the region is
too small to imitate, and for a determinate progress control when a measurable
percentage exists. Do not stand in for fixed chrome that is already on screen.

```tsx
<Skeleton style={{ height: 12, width: 176 }} />
<Skeleton style={{ borderRadius: 24, height: 48, width: 48 }} />
<Skeleton style={{ borderRadius: 12, height: 96, width: 224 }} />
```

## Sizing and shape

Skeleton has no intrinsic size and no size or shape props. Everything comes
from `style`, which is applied after the component's own root styles: set
`height` and `width` to the block being replaced, and override `borderRadius`
for a circular avatar or a larger media tile. A placeholder without a height
collapses and renders nothing visible.

A single placeholder is one block. Build a loading silhouette by composing
several placeholders in the caller's own layout, keeping the silhouette coarse
enough that it never promises detail the real content may not have.

```tsx
<View style={{ flexDirection: 'row', gap: 12 }}>
  <Skeleton style={{ borderRadius: 20, height: 40, width: 40 }} />
  <View style={{ gap: 6 }}>
    <Skeleton style={{ height: 12, width: 160 }} />
    <Skeleton style={{ height: 12, width: 96 }} />
  </View>
</View>
```

## Loading semantics

Placeholders are hidden from assistive technology, so announce the loading
state once on the region that owns the fetch rather than on any placeholder.
Swap placeholders for real content in one step; prefer resolving a group of
fetches together over replacing placeholders one at a time.

Do not wrap a placeholder in a pressable surface to make loading content
"clickable early", and do not keep placeholders mounted for background work
that has no bounded end.

## Motion

The sweep stops entirely under the platform reduced-motion setting, so never
rely on movement alone to communicate that a region is busy. Active
placeholders share one phase even when they mount at different moments.
