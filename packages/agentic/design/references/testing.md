---
id: design.testing
kind: instruction-reference
owner_paths:
  - packages/agentic/design/src/testing
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
Color validation policy, semantic pairings, audit helpers, and conformance
fixtures belong under `src/testing`; export them from the `testing` entry point
when they are generally useful to tests. Testing-only validation is
intentionally omitted from production bundle-size scenarios.

```ts
import { defaultFlexTokens, getContrastFailures, validateContrastPairs } from '@fluentui-react-native/design/testing';

const failures = getContrastFailures(validateContrastPairs(defaultFlexTokens.color, 'light'));
```

The package's internal validation suite audits rest, hover, and pressed values
for both default and Bebop Warm interaction variants. Its pinned conformance
fixtures are implementation evidence rather than public testing exports.
