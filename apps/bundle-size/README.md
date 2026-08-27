# Bundle-size fixture

This private app measures minified, tree-shaken Metro consumer bundles without including a test
app or Storybook catalog. It uses `@rnx-kit/metro-config`,
`@rnx-kit/metro-resolver-symlinks` with `oxc-resolver`, and
`@rnx-kit/metro-serializer-esbuild`. Each target scenario is compared with the same React Native
shell on macOS, Win32, and Windows.

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
directory. The runner passes `--tree-shake true` and `--metafile <scenario>.meta.json` to
`rnx-cli bundle`. The JSON report contains raw bytes, gzip bytes, contributing esbuild input
counts, Metro source-map counts, workspace package contribution bytes, and shell deltas. Raw
bytes are the primary comparison; gzip and module attribution are diagnostic signals. The
terminal summary shows the shell's absolute cost and each package scenario's incremental module
and byte cost above its platform shell, plus signed deltas from the baseline.

The Babel configuration preserves ESM for the serializer while explicitly lowering JSX. The
explicit JSX transform is required because the desktop React Native packages publish JSX in
`.js` files, which esbuild otherwise parses with its plain JavaScript loader.

## Baselines and pull requests

`baseline.json` is the reviewed comparison point for pull requests. Ordinary measurement writes
`dist/bundle-size/report.md` with advisory deltas and never changes the baseline. Update it only
for an intentional bundle change:

```sh
yarn bundle-size:update
```

Review the baseline diff together with the implementation that caused it. The PR workflow adds
the Markdown comparison to its job summary, updates one persistent PR comment, and uploads the
complete `dist/bundle-size` directory, including the esbuild metafiles, for investigation.
Same-repository PRs publish directly; fork and Dependabot reports are strictly validated and
published by a separate trusted completion workflow.

## Adding a package or submodule

1. Add the package to this fixture's dependencies so the pnpm linker exposes it to Metro.
2. Add a scenario to `scenarios.json` with a stable name, module specifier, and either `exports`
   or `namespace: true`.
3. Run `yarn bundle-size` and inspect the shell delta and generated esbuild metafile. The
   metafile can also be loaded into the esbuild bundle analyzer.

Use a supported public package or subpath export when measuring consumer cost. A source-relative
module path is useful for diagnostics, but it does not prove the cost of the published API.
