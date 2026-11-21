# Spinner usage

## When to use

Use a spinner when the app is waiting on work whose remaining duration is
unknown: a network request, a query, or a save. Use it when the wait is long
enough that the surface would otherwise look broken, and short enough that a
progress percentage is not worth showing.

Do not use a spinner when the remaining work is measurable; show determinate
progress instead. Do not use one for work that finishes within a frame or two,
because the appear-and-disappear reads as a glitch. Do not use one as a
permanent decoration on an idle surface.

## Basic usage

```tsx
import { Spinner } from '@fluentui-react-native/agentic-components';

<Spinner accessibilityLabel="Loading messages" />;
```

`size` defaults to `medium`. Pick the size from the surface, not from how
important the wait feels: `x-tiny` through `x-small` sit inline with text or in a
control, `small` through `medium` sit in a list row or a card, and `large`
through `huge` sit alone in an empty region.

```tsx
<Spinner size="x-small" accessibilityLabel="Checking availability" />
```

## Pairing with visible text

Spinner has no text slot. Use an adjacent caption gap of 4 for `x-tiny`
through `x-small`, 6 for `small` and `medium`, or 8 for `large` through `huge`.
Name an exposed spinner with `accessibilityLabelledBy`, or hide it and put the
busy state on the surrounding region. Do not announce both.

```tsx
<View accessibilityState={{ busy: true }} style={{ alignItems: 'center', flexDirection: 'row', gap: 4 }}>
  <Spinner size="x-small" accessible={false} />
  <Text>Saving your changes</Text>
</View>
```

If there is no adjacent name to reference, name the spinner directly:

```tsx
<Spinner size="x-small" accessibilityLabel="Saving your changes" />
```

## Region loading

Prefer one spinner for a region over one spinner per item. Center it in the
space the loaded content will occupy so the layout does not jump when the
content arrives, and keep it mounted for the whole wait rather than remounting
it, which restarts the rotation.

```tsx
{
  isLoading ? (
    <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
      <Spinner size="large" accessibilityLabel="Loading your files" />
    </View>
  ) : (
    <FileList files={files} />
  );
}
```

When the placeholder should suggest the shape of the incoming content rather
than a generic wait, use a skeleton instead of a spinner.

## Common mistakes

Naming the indicator rather than the work: "Spinner" or "Loading" tells the user
nothing. Say what is loading.

Leaving the root exposed to assistive technology next to a visible caption that
says the same thing, which makes the region announce twice. Use
`accessibilityLabelledBy` or `accessible={false}`.

Making the spinner the only signal that a submit succeeded. Spinner never
announces completion; announce or render the result yourself when it lands.
