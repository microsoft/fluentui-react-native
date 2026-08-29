# Divider usage

Use Divider when the boundary between two content groups needs a visible line.
Reach for spacing and type hierarchy first; a Divider on every boundary turns
the rule into noise rather than a signal.

```tsx
<Divider label="Recent files" />
<Divider label={null} icon={null} />
```

The label renders by default. Pass `label={null}` together with `icon={null}`
for a plain rule, which is the right choice when the sections around it are
already named by headings.

## Layout

`center` is the default and reads as a balanced section break. Use `start` when
the label should align with the leading edge of the surrounding content, which
usually matches a list or form that is aligned the same way. Use `end` for the
mirror case. Writing direction determines which end is the start, so do not
pick `start` or `end` to mean left or right.

```tsx
<Divider layout="start" label="Shared with me" />
```

## Orientation

Set `vertical` for a separator between side-by-side columns or inline groups.
A vertical Divider stretches along its parent's height, so give the parent a
definite cross-axis size or let the row stretch its children. Keep vertical
labels short: the text still reads horizontally and widens the separator.

## Content

Both content slots accept a props object or an `as` replacement, so a product
can substitute its own icon or text component while keeping the layout. The
component sets icon size and color and marks the content non-accessible, so a
replacement should accept those props rather than fix its own.

Keep the label to a few words. It is styled as small secondary text and is not
a substitute for a section heading; use a heading when the group needs a name
in the reading order.
