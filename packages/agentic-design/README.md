# `@fluentui-react-native/design`

Core design‑system concepts, utilities, and types for Fluent UI React Native.

This package consolidates the shared, framework‑agnostic building blocks of the design system so that components (and consumers) can depend on a single source of truth instead of re‑deriving the same values. It has two kinds of exports:

- **Global tokens** – the raw, statically analyzable design token constants.
- **Design concepts** – small, reusable utilities and types built on top of those tokens (for example, `shape`).

## Global tokens

Global tokens are exported as individual, statically analyzable constants from a dedicated subpath so that bundlers can tree‑shake unused values:

```ts
import { colorBrand80, cornerRadius40, size80 } from '@fluentui-react-native/design/tokens/global';
```

Because each token is its own named constant (rather than a property on a large object), only the tokens you actually reference are retained in the final bundle.

## Concepts

Design concepts are higher‑level helpers that combine tokens into meaningful, reusable pieces of styling. They are exported from the package root:

```ts
import { shapeStyle, shapeTokens, tightCornerRadius } from '@fluentui-react-native/design';
import type { Shape, ShapeTokenOrStyle } from '@fluentui-react-native/design';
```

### Shape

The `shape` concept describes the corner treatment of a component through a small, fixed vocabulary of shapes. It centralizes the mapping between a semantic shape name and the underlying corner‑radius token so every component renders consistent corners.

#### Shapes

| Shape      | Corner radius token     | Value  | Meaning                         |
| ---------- | ----------------------- | ------ | ------------------------------- |
| `circle`   | `cornerRadiusCircular`  | `9999` | Fully rounded (pill / circle)   |
| `square`   | `cornerRadiusNone`      | `0`    | Sharp, un‑rounded corners       |
| `rounded`  | `cornerRadius40`        | `4`    | Slightly rounded corners        |

The default shape is `rounded`.

#### API

- **`type Shape`** – the union of supported shape names: `'circle' | 'square' | 'rounded'`.
- **`type ShapeTokenOrStyle`** – the style fragment produced for a shape: `{ borderRadius: ViewStyle['borderRadius'] }`. It is intentionally a style object so it can be spread directly into a component's style.
- **`shapeStyle(shape?, fallback?)`** – returns the `ShapeTokenOrStyle` for a shape. Both arguments are optional; an invalid or missing `shape` falls back to `fallback` (and then to the default `rounded`). The returned object has a **stable identity** for the lifetime of the app, so it is safe to use directly in memoized styles without causing re‑renders.
- **`shapeTokens()`** – returns the memoized `Record<Shape, ShapeTokenOrStyle>` for all shapes. Useful when you need to look up multiple shapes or build a token table.
- **`tightCornerRadius`** – a shared constant (`cornerRadius20`, i.e. `2`) for the tighter corner radius used by a few token sets (for example, Badge sizing tokens). Exposed here so the value is defined in one place.

#### Usage

Resolve a shape to a style and spread it into a component:

```ts
import { shapeStyle } from '@fluentui-react-native/design';

const style = {
  ...shapeStyle('circle'), // { borderRadius: 9999 }
  backgroundColor,
};
```

Because `shapeStyle` returns a stable object, it works well inside token/style builders:

```ts
import { shapeStyle } from '@fluentui-react-native/design';
import type { Shape } from '@fluentui-react-native/design';

// `shape` may come from props; an unknown value falls back to 'rounded'.
const rootStyle = shapeStyle(shape as Shape);
```

Look up the whole table when you need more than one shape:

```ts
import { shapeTokens } from '@fluentui-react-native/design';

const { circle, square, rounded } = shapeTokens();
```

> **Note on naming:** the `Shape` vocabulary uses `circle` (not `circular`). Several existing components expose a `shape` prop that uses `circular`. When adopting `shape` in those components, map the prop value to the `Shape` vocabulary (`circular` → `circle`) rather than assuming the strings are identical.
