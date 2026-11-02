---
id: components.agentic.traits
kind: instruction-reference
owner_paths:
  - packages/agentic/components/scripts/spec-contracts/traits.cjs
  - packages/agentic/components/src/common/traitConformance.ts
---

# Component traits

Traits record the styling choices that recur across components — typography, color channels, hover, focus visuals, and
geometry — as one typed constant per component. Contract authoring sets the values; the implementation reads them
instead of repeating the decision in code. The vocabulary and helpers live in `@fluentui-react-native/design/styling`
(the design styling reference `@fluentui-react-native/design/references/styling.md` owns their semantics); the values
belong to each component.

## Where traits live

Each adopting component owns `src/components/<name>/spec/traits.ts`:

```ts
import type { Traits } from '@fluentui-react-native/design/styling';

import type { ButtonAppearance, ButtonSize } from '../button.types';

export const buttonTraits = {
  typography: { content: { lineHeight: 'token', weight: 'regular' } },
  channels: { root: { background: 'interactive', stroke: 'rest' }, content: { foreground: 'interactive' } },
  hover: { base: 'enabled' },
  focusVisual: 'platform',
  geometry: { root: { radius: { small: 'base200', medium: 'base300', large: 'base400' }, strokeWidth: 'thin' } },
} as const satisfies Traits<'root' | 'content', ButtonAppearance, ButtonSize>;
```

- Name the constant `<camelName>Traits`. `Traits<Part, Variant, Size>` takes the styled part names, the appearance
  axis, and the size axis; pass `never` for a missing axis.
- Link it from the `SPEC.md` front matter with `traits: ./spec/traits.ts` and `traits-schema: 1`, and list
  `spec/traits.ts` as evidence for the requirements whose behavior it encodes.
- The constant is private. Never export it from `src/index.ts`, expose it through props, or pass it to a primitive.

## Author traits

The `agentic-component-contract-authoring` skill writes the constant while building the contract, before
implementation:

- Trace each value to a reviewed requirement and list `spec/traits.ts` in that requirement's evidence.
- When current behavior, research, and the contract disagree, classify the difference in the contract instead of
  choosing a value silently. Platform and native-versus-web differences are documented divergences.
- Never write a placeholder. Leave an undecided facet out and describe the open question in the contract prose.
- If a component needs a facet or value the vocabulary lacks, record the need in `SPEC.md` and change the design
  vocabulary first; never define local look-alike types.
- Review the constant with the `SPEC.md`, token bindings, and platform obligations. The contract stays a draft until
  that review is complete.

## Facets

Every facet is optional. Declare a facet only for behavior the component owns.

| Facet         | Values                                                                                                                             | Consume with                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `typography`  | Per part: `lineHeight` is `token`, `omit`, or `layout-only`; `weight` is `regular`, `semibold`, or `unowned`                       | `functionalTypography(tokens, role, traits.typography.<part>)`                 |
| `channels`    | Per part: `background`, `foreground`, and `stroke` are each `unowned`, `rest`, `interactive`, or `authored`                        | `channelStatePriority(mode)` as the last level of that channel's color factory |
| `hover`       | `base` and optional `byAppearance`, each `enabled`, `suppressed`, or `component`                                                   | `resolveHoverMode(traits.hover, appearance)`                                   |
| `focusVisual` | `platform` or `custom-always-visible`                                                                                              | `getFocusVisualOptions(mode)` from `src/common/useFocusVisuals.ts`             |
| `geometry`    | Per part: `radius` is a Flex radius role or `none`, scaled by size; `strokeWidth` is a stroke role or `none`, scaled by appearance | `getRadiusStyleValue` and `getStrokeWidthStyleValue`                           |

- **Typography.** The component still maps each size to its functional role, such as `functionalBodySmall`. `layout-only`
  omits line height from the text style because the component uses it only to size its layout, as Input does.
  `unowned` leaves weight to the platform or another component. A structural weight change, such as Button and ListItem
  painting selected labels semibold to reserve width, stays in code.
- **Channels.** `interactive` paints rest, hovered, and pressed values; `rest` keeps the rest value while hovered or
  pressed; `authored` means the component writes its own state table, as Input's stroke does; `unowned` means another
  component paints the channel. Give each channel whose mode differs its own color factory and state source, so a
  `rest` stroke never receives interaction states.
- **Hover.** Push `hovered` into a state source unless the resolved mode is `suppressed`. `component` still pushes
  `hovered`; it records that the component chooses its own hover paint. `hover` is required when any channel is
  `interactive`. Decide high-contrast hover feedback per component and appearance during contract review; do not rely
  on the derived-color fallback to provide it.
- **Focus visuals.** Keyboard gating stays in the `focused` value the component passes to `useFocusVisuals`.
- **Geometry.** Shapes and relationships stay structural in code: circular and square shapes, an underline variant's
  square corners, and a child or overlay that matches its parent's radius by reading the same trait.

Spacing, padding, icon sizes, motion, and elevation are not traits.

## Consume traits

Import the constant directly. Bind values that do not depend on state once, at module scope (`focusVisualOptions`, a
hover flag, or a state-level tuple) or inside a module-scoped themed factory definition. Resolve values that depend on
state, such as hover by appearance, where the state source is built. Traits are static, so they never belong in cache
keys. The canonical consumer is Button: `button.styles.ts` splits background, stroke, and foreground factories by
channel mode, and `useButton.ts` binds its focus options.

Changing a consumed trait value is a behavior change. Update the contract text and tests in the same change and add a
changeset.

## Checker rules

`yarn check:spec-contracts` parses `spec/traits.ts` without running it, using
[the traits parser](../scripts/spec-contracts/traits.cjs):

- The file contains only `import type` statements and one
  `export const <camelName>Traits = { ... } as const satisfies Traits<...>`.
- Values are literal strings, numbers, booleans, and nested plain objects. Arrays, spreads, computed or shorthand
  keys, repeated keys, methods, accessors, identifiers, calls, templates, casts, and `null` are rejected.
- Top-level keys are limited to the five facets, and `hover` is required when a channel is `interactive`.
- The front matter link is exactly `./spec/traits.ts`, and the link and file exist together. `traits-schema` is
  optional; when present it is `1` and requires `traits`.

TypeScript checks the values against the vocabulary through `satisfies`.

## Conformance tests

Write behavior tests from the contract, independently of the constant. Then add a `<Component> traits conformance`
block that ties the call sites to the constant:

- For channels, `readInteractionStates(target, read)` captures a value at rest, hovered, and pressed, and
  `expectChannelConformance(readout, mode)` checks it against the declared mode. Choose a readout whose tokens have
  distinct interaction values; a selected Card's `strokeNeutralSoft` stroke qualifies, while an `Onloud` foreground does
  not.
- For typography and geometry, compare rendered styles with values computed by the same design helpers from the
  constant, for every size or appearance the trait scales over.

## Adoption

Button, ListItem, Tag, Badge, Card, and Input use traits. Other components adopt them in later changes, after which
traits become required; see [remaining work](remaining-work.md#component-traits-adoption).
