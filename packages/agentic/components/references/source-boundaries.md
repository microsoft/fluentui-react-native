---
id: components.source-boundaries
kind: instruction-reference
owner_paths:
  - packages/agentic/components/src
---

# Source boundaries and extraction

Use this reference with the package [`AGENTS.md`](../AGENTS.md) and the relevant [higher-order component](higher-order-components.md)
or [primitive](primitives.md) reference when a change crosses component boundaries or adds shared code.

## Routing

- Higher-order components live in `src/components`; read [higher-order components](higher-order-components.md).
- Primitive components live in `src/primitives`; read [primitives](primitives.md).
- Shared package-private helpers live in `src/common`.
- Package-wide dependency and extraction reviews use the `agentic-component-optimization` skill.

## Source boundaries

- Production source may depend only on React / React Native native components, `react-native-svg` (for the generated
  icons in `src/common/icons`), `@fluentui-react-native/design`, `@fluentui-react-native/framework-base`, and
  native-core's public modern platform entrypoints.
- Import native-core values only from platform-resolved files (for example `common/popupHost.macos.ts` importing
  `@fluentui-react-native/native-core/macos`). Shared files may use `import type` from `/macos`, whose types the
  `/windows` entrypoint exports identically. Never import its root, `/legacy`, or internals, and give hosts without a
  modern route a default file that fails descriptively on use.
- Generalizable non-styling hooks belong in `framework-base/src/hooks`.
- Styling helpers belong in `agentic/design/src/styling`.
- Component-library-specific non-public types, constants, and helpers belong in `src/common`.
- Primitives are public from `@fluentui-react-native/components/primitives`, must remain unstyled, and require a colocated
  `CONTRACT.md`. Extract one only for a repeated behavioral or structural contract that is useful to consumers; keep
  package-private helpers in `src/common`.

## Icons

- Default icons are the generated Fluent SVG components in `src/common/icons/fluentIcons.generated.tsx`, produced from
  `@fluentui/svg-icons`. Never hand-edit that file. To add or change an icon, edit the
  [icon manifest](../scripts/icons/icon-manifest.mts) and run `yarn gen:icons`; `yarn check:icons`, part of `yarn test`,
  fails when the generated file is stale.
- Components reach those icons only through `semanticIconSources` in `src/common/iconSources.ts`. Map a new
  component's glyphs to a Fluent icon where one exists instead of drawing a Unicode character, and add a semantic key
  when several components share the icon.
- Supply a default with `withDefaultIconSource`, not `defaultProps`, so a caller's `fontSource`, `imageSource`, or
  `svgSource` replaces the default instead of being shadowed by it.
- Fluent icons are drawn per optical size. Use `createSizedIconSource` for a resizable slot: it picks the nearest
  available size and still draws at the requested width and height.
- `FluentSvg` in `src/common/icons/fluentSvg.tsx` is permanent local code. The
  [local generator](../scripts/icons/codegen/index.ts) is a temporary copy of the published codegen; see
  [remaining work](remaining-work.md#switch-to-the-published-icon-codegen).
- Icons follow the `color` prop through `currentColor`; without a `color` they keep the default SVG fill, which is black.
  `react-native-svg` applies an icon's `width` and `height` only when both are non-zero and truncates fractional values
  to whole points, so give an icon whole-number dimensions.

## Optimization principles

- Align native text with View layout, not synthetic text heights or baseline offsets. A font's em size, line box, and
  visible glyph are different measurements. Use `Icon` for icons and `LayoutStableText` for reserved labels; follow
  the [native alignment rules](styles-and-tokens.md#native-text-and-vertical-alignment)
  for editors, mixed-size text rows, and regression coverage.

- Audit dependency direction before introducing shared code.
- Look for repeated types, constants, routines, and subtrees across components.
- Validate extraction payoff before creating another layer of indirection.
- Preserve public component-qualified APIs and explicit exports. Higher-order components belong to the root entry point;
  primitives belong to the `./primitives` entry point.
- Keep local component fixes local; do not widen a tiny edit into a whole-package audit unless repetition or extraction
  is part of the work.
- Do not extract one-off logic, styling choices, or thin wrappers that are clearer in place.
