# Tag usage

## When to use

Use a tag to show a keyword, a category, or a filter that has been applied, and
to let the user take it back off. Tags work best in a row above or beside the
content they filter, or attached to an item to describe it.

Do not use a tag as a button for an action; it reads as a label, and its only
action is removal. Do not use it as a toggle or a selection control, because it
has no selected state. Do not use it for a static badge or count that the user
cannot remove, and do not use it for status, which needs a control that carries
meaning without implying it can be dismissed.

## Basic usage

```tsx
import { Tag } from '@fluentui-react-native/agentic-components';

<Tag content="Engineering" onPress={() => removeFilter('engineering')} />;
```

`appearance` defaults to `secondary`, `size` to `medium`, `shape` to `rounded`,
`layout` to `iconAndText`, and `dismiss` to `true`. With no `content` the tag
renders placeholder text, which is useful in a story and wrong in an app: always
pass a real label.

## Removal is yours

Tag never removes itself. Drop it from your own data in the press handler, and
move focus somewhere sensible, because removing the tag destroys the focused
element.

```tsx
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  {filters.map((filter) => (
    <Tag key={filter.id} content={filter.name} onPress={() => setFilters(filters.filter((f) => f.id !== filter.id))} />
  ))}
</View>
```

When a tag is not removable, set `dismiss={false}` so the glyph disappears and
the tag stops advertising an action it will not perform. The tag is still a
pressable element, so give it a handler or leave it inert deliberately.

```tsx
<Tag content="Read only" dismiss={false} />
```

## Appearance and size

Use `secondary` for most tags, and reserve `primary` for the small number that
should stand out, such as the currently active filter. A row where every tag is
primary emphasizes nothing.

```tsx
<Tag appearance="primary" content="Engineering" />
<Tag size="small" content="Draft" />
```

Use `small` inside dense surfaces such as list rows, and keep one size within a
row. Prefer `rounded` for labeled tags; `circular` is for compact, pill-shaped
treatments. Note that a small circular labeled tag is currently tighter than the
rounded equivalent, which is a tracked divergence.

## Leading icons and the icon-only layout

A leading icon is rendered only when supplied, and it takes the tag's own size
and color, so do not size or color it yourself.

```tsx
<Tag content="Engineering" leadingIcon={<Icon svg={PeopleRegular} />} />
```

The icon-only layout drops the label entirely, so it needs both a leading icon
and an `accessibilityLabel`; without them the tag is unidentifiable and
development builds warn.

```tsx
<Tag layout="iconOnly" accessibilityLabel="Engineering" leadingIcon={<Icon svg={PeopleRegular} />} />
```

Use it only where the glyph alone is unambiguous, and keep a whole row
icon-only rather than mixing layouts.

## Disabled tags

```tsx
<Tag content="Engineering" disabled />
```

A disabled tag cannot be focused or pressed but still reports its disabled
state. Use it when a filter is temporarily locked, and explain why nearby;
prefer not rendering the tag at all when it will never be removable.

## Common mistakes

Expecting the tag to vanish on press. It reports the press and nothing else.

Naming a tag after the removal instead of the thing, which makes a row of tags
all announce the same word.

Leaving the placeholder label in place, or leaving `dismiss` on for a tag that
cannot be removed.

Trying to give the dismiss glyph its own handler or its own focus. There is one
target, and it is the whole tag.
