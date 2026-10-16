# Legacy v0 component framework

These instructions apply to `packages/deprecated/foundation-compose`, which implements the repository's legacy v0
`compose` framework. The consumer recipe, recognition guide, and review checklist for v0 components live in the
shared [v0 reference](../../../references/agents/components/v0.md); read it before changing this package or any v0
component. v0 is maintenance-only (R-V0-001).

## Package boundaries

- `compose` combines `foundation-composable`, themed settings, `foundation-settings`, and `foundation-tokens`.
  Changes to settings override or merge semantics, or to token processing, also require those packages' tests.
- The package publicly exports `compose`, `initializeStyling`, and the compose option, return, settings, styling, and
  type-extraction types listed in `src/index.ts`. `initializeStyling` is infrastructure that `compose` installs
  automatically.
- Preserve settings layering, filters, token key lists, and the prepare/render split that consumers rely on (R-V0-002).

## Validation

```bash
yarn workspace @uifabricshared/foundation-compose build
yarn workspace @uifabricshared/foundation-compose lint
yarn workspace @uifabricshared/foundation-compose test
```

For behavior changes, also build and test affected consumer packages, such as `@fluentui-react-native/button`.
