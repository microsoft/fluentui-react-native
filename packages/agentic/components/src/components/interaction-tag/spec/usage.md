# InteractionTag usage

## Import

```tsx
import { InteractionTag } from '@fluentui-react-native/components';
```

## Two handlers

Both actions are slots, so their handlers live on the slot props rather than on
the component. The dismiss action always needs a name.

```tsx
<InteractionTag
  content="Engineering"
  primaryAction={{ onPress: () => openTeam('engineering') }}
  dismiss={{ accessibilityLabel: 'Remove Engineering', onPress: () => removeTag('engineering') }}
/>
```

## Removing a tag

The component never removes itself. Keep the tags in state and drop the one the
dismiss handler reports.

```tsx
const [tags, setTags] = React.useState(['Design', 'Engineering', 'Research']);

return (
  <View style={styles.row}>
    {tags.map((tag) => (
      <InteractionTag
        content={tag}
        dismiss={{
          accessibilityLabel: `Remove ${tag}`,
          onPress: () => setTags((current) => current.filter((entry) => entry !== tag)),
        }}
        key={tag}
        primaryAction={{ onPress: () => openTag(tag) }}
      />
    ))}
  </View>
);
```

## Leading media

Pass a leading icon for a category, or an avatar for a person. Passing both is a
type error, and at runtime the avatar wins and a development warning is logged.

```tsx
<InteractionTag
  content="Design"
  dismiss={{ accessibilityLabel: 'Remove Design', onPress: onRemove }}
  leadingIcon={{ fontSource: { codepoint: 0x1f3a8 } }}
/>

<InteractionTag
  content="Cameron Evans"
  dismiss={{ accessibilityLabel: 'Remove Cameron Evans', onPress: onRemove }}
  avatar={{ name: 'Cameron Evans' }}
/>
```

## Icon-only

The icon-only layout drops the text and rounds the tag fully, so the primary
action needs its own name.

```tsx
<InteractionTag
  dismiss={{ accessibilityLabel: 'Remove Cameron Evans', onPress: onRemove }}
  avatar={{ name: 'Cameron Evans' }}
  layout="iconOnly"
  primaryAction={{ accessibilityLabel: 'Cameron Evans' }}
/>
```

## Appearance, size, and shape

```tsx
<InteractionTag appearance="primary" content="Selected" dismiss={dismissProps} />
<InteractionTag content="Compact" dismiss={dismissProps} size="small" />
<InteractionTag content="Pill" dismiss={dismissProps} shape="circular" />
```

`shape` applies to the icon-and-text layout only; every icon-only tag is
circular.

## Disabled

One prop disables the whole tag. There is no way to disable one region alone.

```tsx
<InteractionTag content="Locked" disabled dismiss={dismissProps} />
```

## Refs

The top-level `ref` reaches the container. Each action slot carries its own
`ref` for the region itself.

```tsx
const container = React.useRef<View>(null);
const dismissButton = React.useRef<View>(null);

<InteractionTag content="Design" dismiss={{ ...dismissProps, ref: dismissButton }} ref={container} />;
```

## Constraints

- Keep the text short. Long text shrinks and truncates instead of wrapping, and
  a tag is not a place for a sentence.
- Use InteractionTag only when both actions are real. When removal is the only
  action, use [Tag](../../tag/SPEC.md); when nothing is actionable, use a
  non-interactive indicator instead.
- Do not put a pressable element inside `content`. The primary action already
  covers that area and a nested target is unreachable by pointer.
- Wrap a row of tags in a focus-managing container when two tab stops per tag is
  too many.
