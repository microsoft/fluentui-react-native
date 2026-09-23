# Bundle-size fixture

This private app measures minified, tree-shaken esbuild consumer bundles without including a test
app or Storybook catalog. React, React Native, React Native SVG, desktop React Native forks, and
`@svgo` imports are external so measurements contain only the package code under test.

Run every configured scenario from the repository root:

```sh
yarn bundle-size
```

Limit a local run to one or more platforms:

```sh
yarn bundle-size --platform windows
yarn bundle-size --platform macos --platform win32
```

Results, source maps, and esbuild metafiles are written to the ignored `dist/bundle-size`
directory. Platform-specific module resolution prefers `.<platform>`, then `.native`, then
generic TypeScript and JavaScript extensions. Package exports use the `react-native` condition.
The JSON report contains raw bytes, gzip bytes, contributing esbuild input counts, and workspace
package contribution bytes. Raw bytes are the primary comparison; gzip and module attribution
are diagnostic signals. The terminal summary shows each scenario's absolute module and byte cost
plus signed deltas from the baseline.

## Baselines and pull requests

`baseline.json` is the reviewed comparison point for pull requests. Ordinary measurement writes
`dist/bundle-size/report.md` with advisory deltas and never changes the baseline. Update it only
for an intentional bundle change:

```sh
yarn bundle-size:update
```

Review the baseline diff together with the implementation that caused it. The PR workflow adds
the Markdown comparison to its job summary only after validating the trusted report format,
updates one persistent PR comment, and uploads the complete `dist/bundle-size` directory,
including the esbuild metafiles, for investigation. Same-repository PRs publish directly; fork
and Dependabot reports are validated again and published by a separate trusted completion
workflow.

## Adding a package or submodule

1. Add the package to this fixture's dependencies so the pnpm linker exposes it to esbuild.
2. Add a scenario to `scenarios.json` with a stable name, module specifier, and either `exports`
   or `namespace: true`.
3. Run `yarn bundle-size` and inspect the generated esbuild metafile. The metafile can also be
   loaded into the esbuild bundle analyzer.

Use a supported public package or subpath export when measuring consumer cost. A source-relative
module path is useful for diagnostics, but it does not prove the cost of the published API.
