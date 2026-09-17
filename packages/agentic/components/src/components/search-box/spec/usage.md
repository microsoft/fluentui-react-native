# SearchBox usage

## Uncontrolled query

```tsx
<SearchBox accessibilityLabel="Search messages" placeholder="Search messages" onSearch={(query) => runSearch(query)} />
```

The component holds the query. `onSearch` fires when the user presses Return.

## Controlled query

```tsx
const [query, setQuery] = React.useState('');

<SearchBox
  accessibilityLabel="Search files"
  placeholder="Search files"
  value={query}
  onChangeText={setQuery}
  onClear={() => setQuery('')}
  onSearch={runSearch}
/>;
```

When `value` is supplied the caller owns it. Handle `onChangeText` so typing and
clearing both reach the caller's state; `onClear` is an additional notification
rather than a replacement for it.

## Search as you type

```tsx
<SearchBox
  accessibilityLabel="Filter contacts"
  value={query}
  onChangeText={(next) => {
    setQuery(next);
    scheduleFilter(next);
  }}
/>
```

SearchBox has no debounce or throttle policy. Choose the timing in the caller so
it matches the cost of the underlying query.

## Sizes and variants

```tsx
<SearchBox accessibilityLabel="Search" size="small" />
<SearchBox accessibilityLabel="Search" size="large" variant="underline" />
```

`size` drives the field height, the typography, the leading icon size, and the
clear button metrics together. `variant` selects a full boundary or a bottom
edge.

## Disabled and read only

```tsx
<SearchBox accessibilityLabel="Search" disabled value="quarterly report" />
<SearchBox accessibilityLabel="Search" readOnly value="quarterly report" />
```

Disabled blocks editing and dims the text. Read only blocks editing while the
query stays at full emphasis. In both cases the clear button is disabled and
Escape does nothing.

## Replacing the leading icon

```tsx
<SearchBox accessibilityLabel="Search people" icon={{ fontSource: { codepoint: 0x1f464 } }} />
```

Pass `icon={null}` to remove the leading icon entirely. The component still sets
the size and color, so a replacement icon stays aligned with the field.

## Renaming the clear button

```tsx
<SearchBox accessibilityLabel="Search orders" clearButton={{ accessibilityLabel: 'Clear order search' }} />
```

Slot props change the clear button's name, icon, appearance, and style. They do
not change what pressing it does; clearing is owned by the component.

Pass `clearButton={null}` when the surrounding screen supplies its own reset
affordance. Escape still clears.

## Focusing the field

```tsx
const inputRef = React.useRef<TextInput>(null);

<SearchBox accessibilityLabel="Search" textInput={{ ref: inputRef }} />;
```

The root `ref` reaches the container view. Use the `textInput` slot ref to focus
or select text, and the component's own internal reference still works alongside
it.

## Constraints

- SearchBox renders no results, no suggestion list, and no result count. Compose
  those around it.
- There is no error state and no validation message. A query is not saved data.
- Supply an accessible name. `placeholder` is not a name and the component warns
  in development builds when no name is present.
- The root stretches to its container by default. Constrain the width through
  the root `style` when the field should not fill the available space.
