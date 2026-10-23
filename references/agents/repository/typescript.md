---
id: repository.typescript
kind: instruction-reference
owner_paths:
  - tsconfig.json
  - scripts/configs/tsconfig
---

# TypeScript configuration

The repository uses TypeScript 7.0.2 through `tsc`. [Dynamic package extensions](../../../scripts/dynamic.extensions.mts)
add it to every package that has a `tsconfig.json`. The root `tsconfig.json` lists every package under `references`;
`tsc -b` builds them in dependency order, and each package caches incremental state in
`node_modules/.cache/tsconfig.tsbuildinfo`.

- **R-REPO-002:** Do not import more than one React Native fork (`react-native`, `react-native-windows`,
  `react-native-macos`, `@office-iss/react-native-win32`) into a single program's type graph. Keep fork imports in
  `.win32.ts`, `.windows.ts`, or `.macos.ts` files, or redeclare the needed shapes platform-neutrally.

## Settings

- Base config: [scripts/configs/tsconfig/tsconfig.json](../../../scripts/configs/tsconfig/tsconfig.json) extends
  `tsconfig.strict.json`, which extends `@rnx-kit/tsconfig/tsconfig.nodenext.json`.
- `target` and `lib` are `esnext`; `module` is `esnext` with `bundler` resolution; `jsx` is `react-jsx`.
- `rewriteRelativeImportExtensions` is enabled for ESM relative imports.
- `composite: true` is required for project references, and `outDir` is `lib`.
- Build information stays out of Git and package tarballs: the Yarn constraints (`yarn constraints`, run by
  `yarn lint-repo`) require each workspace's `tsconfig.json`, `tsconfig.*.json`, and `targets/tsconfig*.json` that
  writes it to use `node_modules/.cache/<config name>.tsbuildinfo` under the workspace root. Apply the paths with
  `yarn constraints --fix`, then format.
- Strict mode is relaxed for legacy compatibility: `strictNullChecks`, `noImplicitAny`, and `strictBindCallApply` are
  disabled in the base config.

## Compatibility notes

- `suppressImplicitAnyIndexErrors` was removed in TypeScript 5.8 and later.
- `Platform.OS` does not include `'win32'` in the React Native types even though react-native-win32 supports it at
  runtime. Use `Platform.OS === ('win32' as any)`.
- The React Native forks have overlapping but divergent type definitions. Mixing them produces order-dependent type
  confusion under the unified build (R-REPO-002).

## JSX runtime

Component files that render callable slots put `/** @jsxImportSource @fluentui-react-native/framework-base */` on the
first line. The custom runtime optimizes slot rendering, so `withSlots` is unnecessary, and it re-exports `Fragment`.
Compiled output imports the runtime, so packages that use it declare `@fluentui-react-native/framework-base` as a
dependency. The pragma alone does not identify a component's generation; see the
[classification guide](../components/classification.md).
