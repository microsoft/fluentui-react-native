# Optional color utilities

`@fluentui-react-native/design/runtime-colors` ports the default OKLCH
interaction algorithm, and `@fluentui-react-native/design/contrast` ports the
WCAG audit model, from
[`x3-design/fluent-design@d334acf5cbad813f2b7cd554da942b09a7ff8f10`](https://github.com/x3-design/fluent-design/tree/d334acf5cbad813f2b7cd554da942b09a7ff8f10/dev/web/flex-themes).
The implementation source, rather than the stale `contrast.d.ts` declaration,
is authoritative for the dark fallback surface (`#000000`).

The pinned generated interaction table has ten values that do not come from
the default algorithm: four `backgroundNeutralTranslucent` values use the
Bebop Warm reference-backdrop solve, and six light-mode soft/subtle stroke
values use its chroma boost. They are listed with their default and warm values
in `x3InteractionConformance.test.fixture.ts`. The conformance gate verifies
all other generated values exactly and verifies each documented deviation
against both algorithms' expected value.

Both capabilities are optional subpaths and are intentionally absent from the
design root barrel. The `design-theme-state` bundle-size scenario forbids their
source paths, while the `design-runtime-colors` and `design-contrast` scenarios
require their respective paths:

```sh
yarn workspace @fluentui-react-native/bundle-size measure --platform macos
```

The utilities resolve hex, `rgb()`, and `rgba()` literals in JavaScript.
Opaque native values such as `PlatformColor` and `DynamicColorMacOS` produce
structured `unresolvable` diagnostics. Interaction derivation is a standard
contrast fallback only; callers must not apply it to high-contrast themes.

The package Jest suite includes the pinned 118-value interaction fixture and
the contrast conformance gate:

```sh
yarn workspace @fluentui-react-native/design test --runInBand
```

The combined interaction audit also records two pinned upstream failures in
dark pressed state: danger-primary on danger-soft and warning-primary on
warning-soft are below AA text contrast after both values shift. The test locks
those known failures and rejects any additional regression. FURN adds the
issue-required neutral-heavy-stroke pairing at `visibleStroke` (3:1) and
identifies it with `source: 'furn'`; the remaining pairings retain
`source: 'x3'`.
