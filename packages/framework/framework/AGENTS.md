# v1 component framework

These instructions apply to `packages/framework/framework`, which implements the repository's v1 `compose` and
`compressible` framework. The consumer recipe, recognition guide, and review checklist for v1 components live in the
shared [v1 reference](../../../references/agents/components/v1.md); read it before changing this package or any v1
component. v1 is maintenance-only (R-V1-001).

## Package boundaries

- `compose` injects the Fluent `Theme` integration into `composeFactory` from `@fluentui-react-native/composition`.
  Keep theme-agnostic factory work in that lower-level package.
- Styling and slots come from `use-styling`, `use-tokens`, and `use-slots`. Changes to factory, slot, token, or styling
  semantics also require the matching package's tests.
- v1 is built on framework-base's compatibility `stagedComponent` path. Do not migrate it to the modern framework-base
  patterns as part of maintenance (R-V1-002).
- Check `src/index.ts` before adding another public export, and keep exports explicit (R-REPO-001).

## Validation

```bash
yarn workspace @fluentui-react-native/framework build
yarn workspace @fluentui-react-native/framework test
yarn workspace @fluentui-react-native/framework lint
```

The package's direct test covers `compressible`; lower-level compose, slot, token, and styling behavior is tested in
`@fluentui-react-native/composition`, `use-slots`, `use-tokens`, and `use-styling`. Also build and test affected
consumer components, such as `@fluentui-react-native/button`.
