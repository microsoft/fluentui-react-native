# Extract Fluent System Icons for React Native

Install `@fluentui-react-native/extract-icons` as a development dependency. It includes the SVG catalog and SVGR
dependencies needed by `@fluentui/react-native-icons/codegen`.

Generate one `.tsx` module by passing an output path and one or more icon names:

```sh
yarn extract-icons --output src/generated/icons.tsx AccessTime20Regular add_24_filled
```

Names can be case-sensitive component exports (`AccessTime20Regular` or `AccessTimeRegular`) or SVG catalog names
without the `.svg` extension (`access_time_20_regular`). You can mix formats in the same list. All names for the same
SVG select it once, and codegen emits its sized component and any resizable alias.

Relative `--output` paths are resolved from the working directory. The CLI creates parent directories and replaces
existing output files. The generated module imports from `react-native-svg` and `@fluentui/react-native-icons/utils`;
declare `react-native-svg` and `@fluentui/react-native-icons` as runtime dependencies of the app using the generated TSX.

## Shared configuration

```sh
yarn extract-icons --config config/icons.json
```

Under the `extractIcons` key, specify either one `{ "output": "...", "icons": [...] }` object or an array of those
objects. Other top-level keys are ignored.

```json
{
  "extractIcons": [
    {
      "output": "../src/generated/common.tsx",
      "icons": ["AccessTime20Regular"]
    },
    {
      "output": "../src/generated/actions.tsx",
      "icons": ["add_24_filled"]
    }
  ]
}
```

The config path is relative to the working directory; each relative `output` is relative to the config file.
Use any local file Node can load with `require()`, including JSON, CommonJS, and synchronous ES modules, with
either a named `extractIcons` export or a default object containing that key. TypeScript configs use Node's
native type stripping, not a TypeScript compiler or `tsconfig.json`. Only load trusted configs: JavaScript and
TypeScript configs execute when loaded.

SVGR core and its JSX plugin use matching 6.5.1 versions because this SVGR core version declares its own JSX
plugin dependency, letting the upstream generator find it under strict package linkers. The SVG catalog is pinned
to `@fluentui/svg-icons@1.1.345` so generation uses the same source artwork across installs.

Add `--manifest <file.json>` to record the generator and catalog versions and licenses, requested names, resolved
SVG names and SHA-256 digests, and generated module digests. Output paths in the manifest are relative to its
directory.
