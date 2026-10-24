---
id: design.color-lib
kind: instruction-reference
owner_paths:
  - packages/agentic/design/src/color-lib
  - packages/agentic/design/src/flex/colors
---

# Color library

`@fluentui-react-native/design/color-lib` exposes the raw color algorithms for
direct use. Theme authors do not need it: resolved Flex colors compute omitted
interaction states on first read (see `flex-colors.md`). It groups public utilities
by responsibility:

- `parsing.ts` parses literal React Native colors and formats RGBA values;
- `conversion.ts` converts between normalized sRGB and OKLCH;
- `compositing.ts` composites alpha colors and calculates WCAG contrast;
- `interaction.ts` generates one hover or pressed color from a rest color.

Native and dynamic color objects cannot be resolved in JavaScript, so parsing
and interaction APIs return structured diagnostics instead of fabricated
colors. Direct compositing and contrast operations throw descriptive errors
for unsupported values.

The algorithms are ported from
[`x3-design/fluent-design@d334acf5cbad813f2b7cd554da942b09a7ff8f10`](https://github.com/x3-design/fluent-design/tree/d334acf5cbad813f2b7cd554da942b09a7ff8f10/dev/web/flex-themes).
The interaction API knows nothing about Flex tokens. Its options select:

| Option        | Values                           | Effect                                                                                                                                  |
| ------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `colorTone`   | `cool` (default), `warm`         | `cool` shifts OKLCH lightness and preserves chroma; `warm` adds the pinned opacity-aware lightness, chroma, and bounds                  |
| `direction`   | `standard` (default), `inverted` | `inverted` shifts lightness opposite the scheme's standard direction                                                                    |
| `compositing` | `direct` (default), `backdrop`   | For `warm` only, `backdrop` composites a translucent color over the scheme's reference backdrop and solves a source at the target alpha |

```ts
import { getContrastRatio, getHoverColor } from '@fluentui-react-native/design/color-lib';

const hover = getHoverColor('#c02e56', 'light', { colorTone: 'warm', direction: 'inverted' });
const ratio = getContrastRatio('#000000db', '#ffffff');
```

Token classification is Flex policy, not part of this library.
`INTERACTIVE_COLOR_TOKENS`, `isInteractiveColorToken`, and
`isInverseInteractionToken` are exported from the package root and owned by
`src/flex/colors/`, which maps each Flex token to a compositing mode and uses
the authored color type as the direction before calling `getInteractionColor`.
The inverse classification sets the type of package defaults and
legacy-projected colors; newly authored colors declare their type.

Keep the public exports narrow and add APIs only for demonstrated production
needs. The public interaction surface is intentionally limited to generating one
hover or pressed value at a time. Bulk fallback helpers and algorithm constants
remain internal until a production consumer needs them.

The library imports only its own modules and shared types; it never reaches
Flex, Fluent, or the test-only `testing` submodule. The modern root reaches
`interaction.ts` and its parsing and conversion dependencies through the Flex
interaction policy, but not `compositing.ts`.
