# Color library

`@fluentui-react-native/design/color-lib` is the opt-in runtime color engine.
It groups public utilities by responsibility:

- `parsing.ts` parses literal React Native colors and formats RGBA values;
- `conversion.ts` converts between normalized sRGB and OKLCH;
- `compositing.ts` composites alpha colors and calculates WCAG contrast;
- `interaction.ts` generates hover and pressed colors with the default or
  Bebop Warm algorithm.

Native and dynamic color objects cannot be resolved in JavaScript, so parsing
and interaction APIs return structured diagnostics instead of fabricated
colors. Direct compositing and contrast operations throw descriptive errors
for unsupported values.

The algorithms are ported from
[`x3-design/fluent-design@d334acf5cbad813f2b7cd554da942b09a7ff8f10`](https://github.com/x3-design/fluent-design/tree/d334acf5cbad813f2b7cd554da942b09a7ff8f10/dev/web/flex-themes).
The default variant preserves chroma. The `bebopWarm` variant adds the pinned
opacity-aware lightness, chroma, bounds, and translucent reference-backdrop
solve.

```ts
import { getContrastRatio, getHoverColor } from '@fluentui-react-native/design/color-lib';

const hover = getHoverColor('#c02e56', 'backgroundDangerLoud', 'light', {
  variant: 'bebopWarm',
});
const ratio = getContrastRatio('#000000db', '#ffffff');
```

The public interaction surface is intentionally limited to generating one
hover or pressed value at a time. Bulk fallback helpers and algorithm constants
remain internal until a production consumer needs them.

The submodule is absent from the design root barrel and does not import the
test-only `testing` submodule.
