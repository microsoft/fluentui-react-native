# Design agent instructions

This is the instruction root for `@fluentui-react-native/design` and every descendant. The package owns Fluent UI React
Native's theming contract: theme sources and providers, structured appearance, Flex and legacy tokens, the token
mappings, themed style factories, the runtime color library, and test-only design fixtures.

## Start here

Read the [user guide](README.md), then select the narrowest topic in the [reference index](references/README.md):

| Task                                                                      | Read                                           |
| ------------------------------------------------------------------------- | ---------------------------------------------- |
| Theme authoring, providers, appearance, theme hooks, or legacy projection | [Theming](references/theming.md)               |
| Token sources, Flex token mapping, or the pinned x3 source                | [Tokens](references/tokens.md)                 |
| Themed style caches or state and color style factories                    | [Styling](references/styling.md)               |
| Runtime color parsing, contrast, or interaction colors                    | [Color library](references/color-lib.md)       |
| Test fixtures or contrast validation                                      | [Testing helpers](references/testing.md)       |
| Exports, subpaths, bundle boundaries, or compatibility packages           | [Entry points](references/entry-points.md)     |
| Source layout, generated files, tests, or validation                      | [Contributing](references/contributing.md)     |
| Planning theming or appearance work                                       | [Remaining work](references/remaining-work.md) |

Component authors applying tokens and styles also follow their component workflow; for agentic components that is the
repository reference `components.agentic.styles-and-tokens`.

## Invariants

- Keep one `ThemeProvider` for both authoring models. Providers publish metadata; only hooks construct converted
  models, and neither hook constructs the model it does not return.
- Key caches by source, revision, and resolved appearance, keep them outside author-owned objects, and give every new
  `ThemeState` a new style registry.
- Keep the root entry point free of the legacy projection, legacy token payloads, and the color library; legacy and
  optional APIs stay behind their subpaths.
- Treat `src/tokens/mappings/flex-token-map.yaml` as the canonical token mapping (R-DESIGN-001), and regenerate rather
  than edit generated token and projection files.
- Production code must not depend on the `testing` entry point (R-DESIGN-002).
- Update the owning reference with every behavior or API change, and record unfinished work only in
  `references/remaining-work.md` (R-PKGDOC-009).

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, `yarn test`, and `yarn check:mappings` in this package, add a changeset,
and finish with `yarn clean-lage-cache` followed by `yarn lage buildci`. See
[contributing](references/contributing.md#validation).
