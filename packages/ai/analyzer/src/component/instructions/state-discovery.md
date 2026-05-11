# Component State Discovery

You are inspecting a FluentUI React Native component and producing a
`ComponentMetadata` JSON document that describes which states are worth
snapshotting. The document feeds `runComponentMatrix`, which renders the
component once per state and captures its render tree, accessibility
tree, and token usage. The more accurate the metadata, the more useful
the resulting snapshots.

## What to inspect

You will be given one or more source files for a single component. Read
all of them before writing anything. Pay particular attention to:

- The component's prop type (`<Name>Props` or the inferred props on the
  exported function).
- Any platform-specific files (`.ios.ts`, `.android.ts`, `.win32.ts`,
  `.macos.ts`) — they reveal slots and behaviour that differ per
  platform.
- The styling file (`<Name>.styling.ts`) — token names referenced here
  often imply a visual state (`pressedBackground`, `disabledIconColor`).
- Any `usePressableState`, `useSelected`, `useFocusState` hook usage —
  these expose hover, press, focus, and selection states.

## What to emit

Return a single JSON object that conforms to the `ComponentMetadata`
TypeScript interface (see schema at the end of this file). Emit the
JSON literally, with no surrounding prose, no Markdown code fences, no
explanation — the analyzer parses your output directly.

## Required fields

- `name` — display name as it appears in user code (`'Button'`,
  `'Checkbox'`, `'Switch'`).
- `importPath` — the public module specifier
  (`'@fluentui-react-native/button'`).
- `exportName` — the named export (`'Button'`, not the default).
- `states` — an array of state specs. Must contain at least one entry,
  by convention named `'default'`.

## Optional fields

- `baseProps` — props passed in every render. Use this for fixtures the
  component needs to render at all (e.g. `children: 'Hi'` for a label,
  a `testID` you can target with interactions, or a fixed icon prop).
- For each state:
  - `props` — props specific to this state. Merged on top of
    `baseProps` (state wins on collision).
  - `interactions` — ordered list of user actions to apply before
    snapshotting.
  - `description` — short human-readable note. Keep under one line.

## How to enumerate states

Be deliberate; do not enumerate the full Cartesian product. Pick the
smallest representative set that surfaces meaningful visual or
behavioural differences. Heuristics, in priority order:

1. Always include a `'default'` state with no extra props.
2. For every binary visual prop (`disabled`, `loading`, `checked`,
   `selected`, `invalid`, `required`), add one state that turns it on
   in isolation.
3. For every interaction the component handles (`onPress`, `onFocus`,
   `onChangeText`, `onHoverIn`/`onHoverOut`), add one state that drives
   the corresponding visual: `'pressed'`, `'focused'`, `'hovered'`,
   `'with-text'`.
4. For appearance enums with three or more values (`appearance`,
   `size`, `shape`), pick the two most distinct values and add a state
   for each. Skip values that only swap a token without changing
   structure.
5. Stop at ~7 states unless the component genuinely needs more. A long
   matrix is noise; reviewers stop reading after the first few
   snapshots.

## Interaction kinds

Pick the most specific kind for the user action you want to drive:

| Kind          | Use for                                                  |
| ------------- | -------------------------------------------------------- |
| `press`       | `onPress` handlers; complete tap.                        |
| `focus`       | `onFocus` (keyboard / programmatic).                     |
| `blur`        | `onBlur`.                                                |
| `hover`       | `onHoverIn`/`onHoverOut` from `usePressableState`.       |
| `changeText`  | `TextInput`-style text entry.                            |
| `scroll`      | `ScrollView`/`FlatList` content offset changes.          |
| `custom`      | Extension hook — only when nothing above fits.           |

Every non-`custom` interaction targets a node by `testID`. Make sure
the `targetTestID` you reference is either set on `baseProps.testID` or
on the state's `props.testID`; otherwise the validator will warn that
the testID is dangling, and the matrix will throw at runtime when it
tries to look it up.

## Self-check before emitting

Before returning your JSON, verify:

- Every `state.id` is unique.
- Every `interaction.targetTestID` appears as a `testID` somewhere in
  `baseProps` or `state.props`.
- The JSON parses (no trailing commas, no comments, no JS expressions).
- The shape matches the schema below exactly.

## Schema

```ts
type ComponentInteraction =
  | { kind: 'press'; targetTestID: string }
  | { kind: 'focus'; targetTestID: string }
  | { kind: 'blur'; targetTestID: string }
  | { kind: 'hover'; targetTestID: string; state: 'in' | 'out' }
  | { kind: 'changeText'; targetTestID: string; text: string }
  | { kind: 'scroll'; targetTestID: string; offset: { x: number; y: number } }
  | { kind: 'custom'; name: string; payload: unknown };

interface ComponentStateSpec {
  id: string;
  props?: Record<string, unknown>;
  interactions?: ComponentInteraction[];
  description?: string;
}

interface ComponentMetadata {
  name: string;
  importPath: string;
  exportName: string;
  baseProps?: Record<string, unknown>;
  states: ComponentStateSpec[];
}
```

## Worked example: Button

Source recap (FluentUI RN `Button`):

- Props of interest: `disabled`, `loading`, `appearance` (`'primary' |
  'subtle' | 'outline' | 'accent'`), `size` (`'small' | 'medium' |
  'large'`), `shape` (`'rounded' | 'circular' | 'square'`),
  `iconOnly`, `block`, `children` (label content).
- Handlers: `onPress`, plus pressable hover via the composition
  framework.
- Slots: `root`, `icon`, `content`. The `root` carries the user-
  supplied `testID`.

A reasonable state matrix for `Button`:

```json
{
  "name": "Button",
  "importPath": "@fluentui-react-native/button",
  "exportName": "Button",
  "baseProps": {
    "children": "Hi",
    "testID": "button-root"
  },
  "states": [
    {
      "id": "default",
      "description": "Baseline render with no extra props."
    },
    {
      "id": "disabled",
      "props": { "disabled": true },
      "description": "Disabled appearance and a11y state."
    },
    {
      "id": "primary",
      "props": { "appearance": "primary" },
      "description": "Filled brand-coloured variant."
    },
    {
      "id": "subtle",
      "props": { "appearance": "subtle" },
      "description": "Lowest-emphasis variant."
    },
    {
      "id": "pressed",
      "interactions": [
        { "kind": "press", "targetTestID": "button-root" }
      ],
      "description": "After a synthetic press."
    },
    {
      "id": "hovered",
      "interactions": [
        { "kind": "hover", "targetTestID": "button-root", "state": "in" }
      ],
      "description": "Pointer-hover styling via usePressableState."
    }
  ]
}
```

That document captures the four prop-driven visuals reviewers care
about most (disabled, primary, subtle, default), plus the two
interaction-driven states (pressed, hovered). It skips `size` and
`shape` deliberately — those only swap tokens, which the theme analyzer
already records per state, and adding every value would crowd the
matrix without changing structure.
