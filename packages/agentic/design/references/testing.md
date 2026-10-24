---
id: design.testing
kind: instruction-reference
owner_paths:
  - packages/agentic/design/src/test
---

# Testing helpers

- **R-DESIGN-002:** Production code must not depend on `@fluentui-react-native/design/testing`.

`@fluentui-react-native/design/testing` is the test-only entry point for
fixtures and validation helpers associated with the design package. It exports:

- the generated `defaultFlexTokens` fixture and default resolved appearance;
- `mockTheme` for tests that need a legacy-compatible theme;
- WCAG thresholds and canonical semantic color pairings;
- structured contrast audits and filters for failed or unresolvable pairs.

The color validation helpers build on `color-lib`, but are not designed for
component render paths or other production runtime code. Production consumers
that need parsing, conversion, interaction generation, compositing, or a direct
contrast ratio should import `@fluentui-react-native/design/color-lib`.
Color validation policy, semantic pairings, and audit helpers belong under
`src/test/color-validation`, and conformance fixtures under `src/test/fixtures`;
export them from the `testing` entry point when they are generally useful to
tests. `src/test/compatibility` holds the public-surface, legacy-runtime, and
import-boundary baselines. Testing-only validation is
intentionally omitted from production bundle-size scenarios.

```ts
import { defaultFlexTokens, getContrastFailures, validateContrastPairs } from '@fluentui-react-native/design/testing';

const failures = getContrastFailures(validateContrastPairs(defaultFlexTokens.color, 'light'));
```

The package's internal validation suite audits rest, hover, and pressed values
for both the cool and warm color tones. Its pinned conformance fixtures and the
bulk `getInteractionColorOverrides` helper under `src/test/fixtures` are
implementation evidence rather than public testing exports.
