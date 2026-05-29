# Component Concept Discovery

You are inspecting a FluentUI React Native component and producing a
`ComponentMetadata` document that declares which **concepts** the
component supports. The matrix of states to render is **derived** from
this document by `deriveComponentStates` — you do not hand-pick states.
Your job is to read the source and decide, for each concept, what the
component opts into.

## What to inspect

Read every source file for the component before writing anything:

- The component implementation (`<Name>.tsx`, or
  `<Name>/<Name>.tsx`). Note which framework primitives it uses —
  `compose` from `@fluentui-react-native/framework` (v1) vs.
  `@uifabricshared/foundation-compose` (v0).
- The props/types file (`<Name>.types.ts`). Read every prop the
  component accepts — these are how you populate `appearances`,
  `sizes`, `shapes`, and infer state support.
- The styling file (`<Name>.styling.ts`). Look for a `states` array
  passed to `stylingSettings`. Token names referenced there
  (`pressedBackground`, `disabledIconColor`, `hovered`) confirm which
  interaction states the component renders distinctly.
- Any platform-specific files (`.ios.ts`, `.android.ts`, `.macos.ts`,
  `.win32.ts`, `.windows.ts`) — they confirm which platforms the
  component ships on and may hint at platform-only states.
- The associated hooks (`useButton`, `useToggleButton`, etc.). Look
  for `usePressableState`, `useSelected`, `useFocusState` — these
  expose `hover`, `press`, `focused`, `checked`.

## What to emit

A single `ComponentMetadata` object, typed via
`as const satisfies ComponentMetadata`. Emit it as a TypeScript module,
not raw JSON — the type checker enforces the shape, and a top-level
doc comment lets you capture rationale.

## Required fields

- `name` — display name, e.g. `'Button'`.
- `importPath` — the public module specifier, e.g.
  `'@fluentui-react-native/button'`.
- `exportName` — the named export, e.g. `'ButtonV1'`. Use the export
  as it appears in the package's public barrel.
- `framework` — `'v0' | 'v1' | 'none' | 'native'`. Read the import in
  the implementation file: `from '@fluentui-react-native/framework'`
  is `'v1'`; `from '@uifabricshared/foundation-compose'` is `'v0'`.
- `platforms` — one or more of `'ios' | 'android' | 'macos' |
  'windows' | 'win32'`. List every platform the component supports,
  not just the one you're inspecting on.
- `states` — every interaction state the component opts into. Pick
  from `'disabled' | 'hover' | 'press' | 'checked' | 'focused'`. A
  state is supported if (a) the styling file declares a token key for
  it, (b) the hook subscribes to its event, or (c) a prop turns it
  on.

## Optional fields

- `stateCombos` — curated multi-state combinations meaningful for
  this component. Only list combos that produce a distinct visual.
  Common ones:
  - `['press', 'focused']` for keyboard activation.
  - `['hover', 'checked']` for toggle hover.
  Skip combos that just look like one state overriding the other.
- `appearances` — values the component's `appearance` prop accepts.
  Include standard values (`'default'`, `'primary'`, `'subtle'`,
  `'transparent'`) and any component-specific extensions. Omit when
  the component has no `appearance` prop.
- `sizes` — values the component's `size` prop accepts. Omit when
  there's no `size` prop.
- `shapes` — values the component's `shape` prop accepts. Omit when
  there's no `shape` prop.
- `baseProps` — fixtures the component needs to render at all
  (required children, a default icon, etc.) plus a `testID` if any
  interaction-driven state (`hover`, `press`, `focused`) is in
  `states`. The deriver targets that `testID` when scripting
  interactions.

## How to populate each field

| Concept       | Where to look                                                    |
| ------------- | ---------------------------------------------------------------- |
| `framework`   | Import line for `compose` in the implementation file.            |
| `platforms`   | File extensions present + the test app's platform list.          |
| `states`      | `stylingSettings.states` array + `usePressableState` callbacks.  |
| `stateCombos` | Comments / SPEC.md notes about combined behaviour.               |
| `appearances` | `<Name>Appearance` type union in the types file.                 |
| `sizes`       | `<Name>Size` type union.                                         |
| `shapes`      | `<Name>Shape` type union.                                        |
| `baseProps`   | Required children, required icons, `__DEV__` assertions.         |

## Top-level doc comment

Above the export, write a short doc comment that:

- Names the export and the package it ships from.
- Captures any non-obvious decisions: appearances that aren't
  literally in the type union but map to other values
  (Button's `'accent'` → `'primary'`), states that only render
  distinctly on one platform, combos you considered and rejected.

This comment is read by both humans and AI consumers; keep it
specific.

## Self-check before emitting

- Every entry in `states` either has a styling-file token key, a hook
  subscription, or a prop that turns it on. If you can't point to
  one, drop it.
- Every entry in `stateCombos` is a real combination, not a single
  state typed twice.
- `baseProps.testID` is set whenever `states` contains `'hover'`,
  `'press'`, or `'focused'`. The deriver targets it.
- Custom appearance / size / shape values are exact strings the
  component accepts at runtime — don't invent them.

## Worked example: Button

Sources of interest (FluentUI RN `ButtonV1`):

- `Button.tsx` — imports `compose` from
  `@fluentui-react-native/framework` → `framework: 'v1'`.
- Files exist for `.android`, `.ios`, `.macos`, `.win32`, `.windows`
  → all five platforms.
- `Button.styling.ts` `buttonStates` includes `'hovered'`,
  `'focused'`, `'pressed'`, `'disabled'` → `states: ['disabled',
  'hover', 'press', 'focused']`. (Note the styling file's plural
  names map to our concept-level singular names.)
- `Button.types.ts` `ButtonAppearance = 'primary' | 'subtle' |
  'accent' | 'outline'` → appearances includes those four.
- `ButtonSize = 'small' | 'medium' | 'large'`, `ButtonShape =
  'rounded' | 'circular' | 'square'` → sizes and shapes follow.
- No `checked` prop and no `useSelected` hook → omit `'checked'`.

```ts
import type { ComponentMetadata } from '@fluentui-react-native/concepts';

/**
 * `ButtonV1` from `@fluentui-react-native/button`. Built on the v1
 * composition framework and ships on every supported platform.
 *
 * `accent` maps to `primary` on every platform per
 * `getPlatformSpecificAppearance`, but it is accepted at the prop
 * surface so we keep it. `outline` renders distinctly only on mobile;
 * other platforms fall through to the default.
 *
 * The `press`+`focused` combo is included because win32 / Windows
 * keyboard activation drives both at once and the two-tone focus
 * border only appears when both are active.
 */
export const buttonV1Metadata = {
  name: 'Button',
  importPath: '@fluentui-react-native/button',
  exportName: 'ButtonV1',
  framework: 'v1',
  platforms: ['ios', 'android', 'macos', 'win32', 'windows'],
  states: ['disabled', 'hover', 'press', 'focused'],
  stateCombos: [['press', 'focused']],
  appearances: ['primary', 'subtle', 'accent', 'outline'],
  sizes: ['small', 'medium', 'large'],
  shapes: ['rounded', 'circular', 'square'],
  baseProps: {
    children: 'Hi',
    testID: 'button-root',
  },
} as const satisfies ComponentMetadata;
```
