---
name: search-box
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# SearchBox

## Scope

SearchBox is a single-line query field. It delegates the field container, the
boundary stroke, the size metrics, the typography, and the interaction-state
precedence to the Input pipeline, and adds three things of its own: a leading
search icon, a trailing clear button that appears only while the field holds a
query, and search semantics for submitting and abandoning a query.

SearchBox owns no results list, no suggestion popup, no debounce or throttle
policy, no result-count announcement, and no surrounding search region. It is
not a combobox, a picker, or a form field: the value is a transient query
rather than data that is saved, so there is no error state and no validation
message.

## Public contract

### Props and defaults

| Prop                                                                      | Type                       | Default   | Contract                                                                                  |
| ------------------------------------------------------------------------- | -------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `variant`                                                                 | `outline \| underline`     | `outline` | Forwarded to the field. Selects a full border or a bottom edge.                           |
| `size`                                                                    | `small \| medium \| large` | `medium`  | Forwarded to the field, and selects the search icon size and the clear button metrics.    |
| `disabled`                                                                | `boolean`                  | `false`   | Blocks editing and clearing, and disables the clear button along with the field.          |
| `readOnly`                                                                | `boolean`                  | `false`   | Blocks editing and clearing while the value stays announced at primary emphasis.          |
| `value`                                                                   | `string`                   | absent    | When supplied, the query is externally driven.                                            |
| `defaultValue`                                                            | `string`                   | `''`      | The starting query while the value is internally driven.                                  |
| `placeholder`                                                             | `string`                   | absent    | Placeholder text shown while the query is empty. It is never the accessible name.         |
| `onChangeText`                                                            | `(text: string) => void`   | absent    | Called with the next query on every accepted edit, including the empty string on a clear. |
| `onSearch`                                                                | `(value: string) => void`  | absent    | Called with the current query when the platform text input reports an explicit submit.    |
| `onClear`                                                                 | `() => void`               | absent    | Called after the clear affordance empties the query.                                      |
| `onFocus`, `onBlur`, `onHoverIn`, `onHoverOut`, `onPressIn`, `onPressOut` | handlers                   | absent    | Forwarded to the text input alongside the component's own state tracking.                 |

The root accepts the owned `ViewProps` surface, including its `ref`.
`accessibilityLabel`, `accessibilityHint`, `accessibilityState`, `accessible`,
`focusable`, and `testID` are lifted from the root onto the text input, because
the text input is the accessible element. A caller `style` is applied to the
root after the token-derived root styles.

### Slots and anatomy

`textInput`, `icon`, and `clearButton` are public slots and accept a props
object or an `as` replacement component.

The render order is the root, then the contents row, then the icon-and-text
stack containing the search icon and the text input, then the clear button
group, then the underline when the underline variant is active.

| Slot                | Rendered when                                                   | Contract                                                                                                           |
| ------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `root`              | always                                                          | A non-accessible `View` that owns the corner radius, overflow clipping, and the caller style.                      |
| Contents            | always                                                          | A non-accessible row that owns the background, the stroke, and the minimum height.                                 |
| Icon-and-text stack | always                                                          | A non-accessible row that owns horizontal padding and lets the text input grow and shrink.                         |
| `icon`              | by default, unless the slot is `null`                           | The leading search icon. Decorative, hidden from the accessibility tree, sized and colored from the field metrics. |
| `textInput`         | always                                                          | The accessible element. It carries role, name, state, editability, and the resolved text style.                    |
| Clear button group  | the query is non-empty and the `clearButton` slot is not `null` | A non-accessible row that owns the trailing gap and end padding.                                                   |
| `clearButton`       | the query is non-empty and the slot is not `null`               | An icon-only circular secondary `Button` with a default accessible name. A separate focus stop.                    |
| Underline           | `variant="underline"`                                           | An absolutely positioned bottom-edge view inside the contents row.                                                 |

The clear button's press behavior and disabled resolution are owned by the
component. Slot props change its name, icon, appearance, shape, size, style,
and test identifier; they do not replace what pressing it does.

### Requirements

- **SBX-001:** Resolve the documented defaults, keep the supported native root
  props including `ref`, and move the accessibility and identification props to
  the text input.
- **SBX-002:** Own the query as a controllable string, report every accepted
  edit through `onChangeText`, and refuse to update the internally driven query
  while disabled or read only.
- **SBX-003:** Render the leading search icon by default, size and color it
  from the resolved field metrics so it matches the field's own leading icon,
  keep it out of the accessibility tree, and allow it to be replaced or removed
  through its slot.
- **SBX-004:** Render the clear button and its group only while the query is
  non-empty, give it an icon-only circular secondary appearance with a default
  accessible name and per-size metrics, and disable it whenever the field is
  disabled or read only.
- **SBX-005:** Clearing empties the query, reports the empty string through
  `onChangeText`, reports `onClear`, and returns focus to the text input.
- **SBX-006:** Report an explicit submit through `onSearch` with the current
  query, and clear the query when the text input reports an escape key while
  the field holds one.
- **SBX-007:** Expose textbox semantics on the text input with disabled and
  read-only state, warn in development builds when no accessible name is
  supplied, keep every wrapper view non-accessible, and keep the clear button a
  separate accessible control.
- **SBX-008:** Resolve every field chrome, size, typography, and visual-state
  binding through the Input pipeline rather than redefining them, and apply the
  caller `style` last.

## Platform behavior

Windows and macOS use the platform text input for caret placement, selection,
text composition, clipboard behavior, and character entry. SearchBox adds no
character handling and does not intercept Tab, so the platform tab order still
moves from the field to the clear button and out of the control.

Explicit submission is read from the platform text input's submit event, which
is raised for the Return key on a single-line field on both platforms. Escape
is read from the text input's key event and matched against the platform key
name. Key delivery to a focused text input is a platform behavior rather than a
guarantee of this component, so the clear button is always available as the
pointer and screen-reader path to the same result.

Hover and press state are tracked from events on the text input, inherited from
the field pipeline, so pointer feedback follows the text area rather than the
whole container. The clear button runs its own hover, press, and focus visuals
inside the field.

There is no timed animation, so the clear button appears and disappears
immediately and reduced-motion settings need no separate path.

## Divergences from Flex

| ID                             | Disposition    | React Native contract                                                                                                                                                                                                        | Follow-up                                                                                             |
| ------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `search-box-region-semantics`  | Not applicable | The search landmark and the dedicated search input type are document semantics. React Native exposes a text input with textbox semantics and leaves region grouping to the host screen.                                      | None. Screens that need a named search region label the surrounding container themselves.             |
| `search-box-clear-target-size` | Accepted       | The clear button is a 24pt circle at medium and large. At small the field is only 24pt tall, so the clear button is inset to a 20pt circle to keep the field boundary and the button's focus visual visible.                 | None. Escape clears the same query, and the small button keeps the largest hit area the field allows. |
| `search-box-placeholder-text`  | Accepted       | There is no built-in placeholder string. The package ships no localized content, so a default English prompt would be wrong for most callers.                                                                                | None. Callers supply both the placeholder and the accessible name.                                    |
| `search-box-clear-motion`      | Deferred       | The clear button appears and disappears without a fade, and there is no reduced-motion branch because there is no motion.                                                                                                    | Revisit if the package adopts a shared enter and exit transition for conditionally rendered controls. |
| `search-box-focus-indicator`   | Deferred       | The field inherits the Input pipeline's focus treatment, which recolors the boundary to the heavy neutral stroke instead of drawing a style-specific focus visual. The clear button keeps the shared component focus visual. | Resolved by the matching Input follow-up; SearchBox picks it up without a contract change.            |

## Conformance

| Requirement | Evidence                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------- |
| SBX-001     | `search-box.types.ts`, `useSearchBox.ts`, `search-box.types.test.tsx`, `search-box.test.tsx` |
| SBX-002     | `useSearchBox.ts`, `search-box.test.tsx`                                                     |
| SBX-003     | `useSearchBox.ts`, `useSearchBoxStyles.ts`, `search-box.test.tsx`                            |
| SBX-004     | `useSearchBox.ts`, `search-box.styles.ts`, `renderSearchBox.tsx`, `search-box.test.tsx`      |
| SBX-005     | `useSearchBox.ts`, `renderSearchBox.tsx`, `search-box.test.tsx`                              |
| SBX-006     | `useSearchBox.ts`, `search-box.test.tsx`, `search-box.stories.tsx`                           |
| SBX-007     | `useSearchBox.ts`, `useSearchBoxStyles.ts`, `search-box.test.tsx`                            |
| SBX-008     | `useSearchBox.ts`, `useSearchBoxStyles.ts`, `search-box.test.tsx`                            |
