---
component: List
platform: react-native (Windows, macOS)
---

# List Interaction (React Native — Windows & macOS)

List's keyboard model is driven by the `navigationMode` implementation prop (`undefined` / `items` / `composite`). Setting `selectionMode` implicitly upgrades `undefined` → `items`. See `accessibility.md` for the full role and selection-mode matrix that pairs with the keys documented here.

## Keyboard navigation

### `navigationMode="undefined"` (default)

- No items are focusable; List is read-only by keyboard.
- If the List itself carries `tabIndex={0}`, it receives focus on Tab and Up/Down arrows scroll the list within its scroll container. No item-level focus.

### `navigationMode="items"`

Each row is focusable. List uses roving tabindex — exactly one row carries `tabindex="0"` at a time.

- **Tab** — moves focus into the List (to the previously focused row, or the first selected row in Single/Multiple modes, or the first focusable row). A second Tab leaves the List.
- **Arrow Down** — moves focus to the next focusable row.
- **Arrow Up** — moves focus to the previous focusable row.
- **Home** — moves focus to the first focusable row.
- **End** — moves focus to the last focusable row.
- **Enter** — fires the row's `onAction` (primary activation: navigate, drill in, etc.). When Selection mode is Single or Multiple, Enter also toggles selection **unless** the `onAction` callback calls its prevention API.
- **Space** — toggles selection on the focused row when Selection mode is Single or Multiple. **Space always toggles selection** regardless of `onAction`. When Selection mode is None, Space activates the row (same as Enter).
- **Type-ahead** — typing a character moves focus to the next row whose primary label starts with that character.
- **Clicking the embedded Checkbox/Radio selection indicator** always toggles selection, regardless of `onAction`.

Disabled rows are skipped. Dividers are not focusable and are skipped.

### `navigationMode="composite"`

Each row is focusable AND inner focusables inside each row are reachable via inline arrows. List uses roving tabindex at the row level; row-internal focus is managed within the focused row.

- **Tab** — moves focus into the List (same initial-focus rules as `items` mode). A second Tab leaves the List entirely — Tab does not step through inner focusables.
- **Arrow Down / Arrow Up** — moves focus between rows (same as `items`).
- **Arrow Right** — moves focus into the focused row's first inner focusable, then through subsequent inner focusables.
- **Arrow Left** — moves focus to the previous inner focusable, or back to the row itself if focus is on the first inner focusable.
- **Home / End** — first / last row (same as `items`).
- **Enter** — fires `onAction` on the focused row (or on the focused inner element, when one of the inner focusables has focus). Selection toggle rules match `items` mode.
- **Space** — toggles selection on the focused row when Selection mode is Single or Multiple. When focus is on an inner focusable, Space follows that element's native behavior (e.g. activates a button), **not** row selection.
- **Type-ahead** — typing a character moves row focus to the next row whose primary label starts with that character.
- **Clicking the embedded Checkbox/Radio selection indicator** always toggles selection.

Composite rows must follow the accessibility wrapper contract documented in `accessibility.md`.

## Focus management

- **Roving tabindex** (`items` and `composite` modes): exactly one row holds `tabindex="0"`; all other rows are `tabindex="-1"`. Arrow keys move the active tabindex and call `.focus()` on the new target.
- **Initial focus on Tab-in:** previously focused row → first selected row (Single/Multiple) → first focusable row.
- **Focus ring:** rendered by ListItem (and by inner focusables in composite mode) on `:focus-visible` using the universal dual-outline focus ring — see `flex-system:styling`.
- **Focus return after drill-in:** when a row activates a navigation that leaves the page and the user returns, focus restoration is the consuming surface's responsibility — List does not own cross-page focus state.

## Activation contract

- **Use `onAction`, not `onClick`.** `onAction` is the supported callback for primary activation — it fires on click, Enter, and (when Selection mode = None) Space. It also coordinates with the selection model so Enter can both fire and toggle selection in one user action.
- `onClick` will not fire on keyboard activation, which silently breaks keyboard support. Treat any use of `onClick` on a List or ListItem as a bug.

## Animation

The List container itself does not animate. Row-level state transitions (hover, pressed, selected backgrounds) are owned by `flex-components:list-item`. Selection indicator transitions are owned by `flex-components:checkbox` and the single-select radio indicator.

> **Reduced motion:** When the OS reduce-motion setting is set, all row state transitions and selection indicator transitions should be instant. List itself has no transitions to suppress.
