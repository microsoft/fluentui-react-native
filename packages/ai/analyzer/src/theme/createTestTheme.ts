import type { Theme } from '@fluentui-react-native/theme-types';

import type { TokenRegistry } from './tokenRegistry.ts';
import { createTokenRegistry } from './tokenRegistry.ts';

/**
 * A `Theme` paired with the registry that records each leaf token's
 * origin path. Most callers want both — the theme to drive rendering,
 * and the registry to reverse-map resolved style values back to
 * token paths.
 *
 * `theme` and `registry` are produced together by
 * {@link createTestTheme} and should not be substituted independently;
 * a theme whose sentinels were generated under a different registry
 * cannot be reverse-mapped.
 */
export interface TestThemeBundle {
  /** The theme object, ready to hand to a `ThemeProvider`. */
  theme: Theme;
  /** Registry recording every leaf sentinel produced for `theme`. */
  registry: TokenRegistry;
}

// ----- Color sentinel generation ----------------------------------------------------------------

/**
 * Hash a token path to a 24-bit color. Tries a sequence of salts until
 * the registry has no collision — the brief guarantees uniqueness, but
 * `path -> hex` is lossy, so a determined adversary path can clash.
 */
function makeColorForPath(path: string, isUsed: (color: string) => boolean): string {
  for (let salt = 0; salt < 0x10_00_00; salt++) {
    const seed = salt === 0 ? path : `${path}#${salt}`;
    // Simple non-cryptographic hash. 24-bit output, sign-stripped.
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    }
    const hex = (h & 0xff_ff_ff).toString(16).padStart(6, '0');
    const color = `#${hex}`;
    if (!isUsed(color)) {
      return color;
    }
  }
  // The 24-bit space has 16M slots; running out is effectively impossible
  // for the hundred-or-so paths we generate, but throw rather than return
  // a duplicate to keep the registry's invariant.
  throw new Error(`createTestTheme: exhausted color salts for path ${JSON.stringify(path)}`);
}

// ----- Number sentinel generation ---------------------------------------------------------------

/**
 * Counter-backed numeric sentinel generator. Different RN style
 * properties tolerate different ranges (font weights must be CSS
 * weights; sizes are positive integers; offsets/blur are any number),
 * so we expose small typed factories rather than one universal
 * generator.
 *
 * Each factory uses a disjoint numeric range so two factories never
 * mint the same value — important because the registry refuses to
 * record a value under two different paths.
 *
 *   sizes:        100..999
 *   line heights: 10_000..19_999
 *   shadow x/y/b: 20_000..29_999
 *   weights:      `'w<n>'` strings (not numbers; see note below)
 *
 * Font weight in React Native is typed as
 * `'normal' | 'bold' | '100' | ... | '900' | number`. We deliberately
 * use unique non-CSS strings (`'w1'`, `'w2'`, ...) because there are
 * only 11 legal CSS weight strings and the theme needs > 30 unique
 * weight tokens (2 named + one per variant). React-test-renderer
 * doesn't validate the value at runtime, so a synthetic string is
 * fine for analyzer-time uniqueness even though it would be rejected
 * by RN at paint time.
 */
interface NumericFactories {
  size(): number;
  weight(): string;
  shadowNumeric(): number;
  lineHeight(): number;
}

function makeNumericFactories(): NumericFactories {
  let sizeCounter = 100;
  let lineHeightCounter = 10_000;
  let shadowCounter = 20_000;
  let weightCounter = 1;
  return {
    size: () => sizeCounter++,
    weight: () => `w${weightCounter++}`,
    shadowNumeric: () => shadowCounter++,
    lineHeight: () => lineHeightCounter++,
  };
}

// ----- String sentinel generation ---------------------------------------------------------------

/**
 * Generates string sentinels that embed the token path. Two flavors:
 * - **font family**: a plain string that RN will accept as a font name
 *   (it tolerates arbitrary strings since fonts are looked up by name).
 *   Embedding the path keeps debug output legible while still acting
 *   as a unique sentinel.
 * - **spacing**: must be a CSS-style px string per the `Spacing` type.
 *   Counter-derived px values stay legal while remaining unique.
 */
interface StringFactories {
  fontFamily(path: string): string;
  spacingPx(): `${number}px`;
}

function makeStringFactories(): StringFactories {
  // Spacing counter avoids small values so it doesn't collide with size sentinels
  // when both end up as numbers somewhere downstream.
  let spacingCounter = 1000;
  return {
    fontFamily: (path) => `__sentinel:${path}`,
    spacingPx: () => `${spacingCounter++}px` as `${number}px`,
  };
}

// ----- Component-tokens proxy --------------------------------------------------------------------

/**
 * `theme.components[name]` is consumed by the framework as the
 * per-component **override** layer on top of `defaultXxxTokens`.
 * Defaults supply every token key the component needs, populated with
 * unique sentinels via `theme.colors.*`, `theme.spacing.*`, etc. So
 * for the base test theme we leave the component override layer
 * empty — `theme.components[name]` is `undefined`, which the framework
 * handles by falling back to `{}`.
 *
 * We still return a Proxy from `theme.components`, rather than a plain
 * `{}`, for two reasons:
 *
 * 1. **Forward compatibility** — if downstream code uses
 *    `Object.keys(theme.components)`, it won't blow up; the proxy
 *    answers with the registered component names.
 * 2. **Optional override hook** — a future test that wants to assert
 *    "the per-component override layer wins" can replace
 *    `theme.components.SomeComponent` with a real object holding
 *    sentinel values; the rest of the machinery cooperates because
 *    proxy `set` writes through.
 */
function createComponentsProxy(): Record<string, Record<string, unknown>> {
  const backing: Record<string, Record<string, unknown>> = {};
  return new Proxy(backing, {
    get(target, key) {
      if (typeof key !== 'string') {
        return Reflect.get(target, key);
      }
      // Returning `undefined` here is intentional — see comment above.
      // The framework's `getComponentInfo` returns `undefined || {}`, so
      // an undefined slot means "no overrides; use the defaults".
      // If a test assigned something via `theme.components.X = ...`, we
      // pick it up from the backing store.
      return target[key];
    },
    set(target, key, value) {
      if (typeof key === 'string') {
        target[key] = value as Record<string, unknown>;
      }
      return true;
    },
    has(target, key) {
      return typeof key === 'string' && key in target;
    },
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(target, key) {
      return Reflect.getOwnPropertyDescriptor(target, key);
    },
  });
}

// ----- Theme construction -----------------------------------------------------------------------

/**
 * Build a {@link Theme} whose every leaf value is a unique sentinel,
 * and a {@link TokenRegistry} recording the path -> sentinel map.
 *
 * Strategies (one per leaf type):
 *
 * - **Colors** (`#RRGGBB` strings) — hashed from the dotted path; on
 *   collision (rare) we re-hash with a salt suffix.
 * - **Font sizes** — small monotonic integers (100, 101, 102, ...).
 * - **Font weights** — CSS weight strings (`'100'..'900'`), cycled.
 * - **Font families** — `__sentinel:<path>` strings.
 * - **Spacing** — px strings (`'1000px'`, `'1001px'`, ...).
 * - **Shadow offsets / blur** — small monotonic integers.
 * - **Variants** — registered both at the object level *and* at each
 *   leaf field. Most consumers spread the whole variant, so the
 *   object-level registration catches them; field-level registration
 *   catches the rarer case where individual fields are read.
 *
 * The returned bundle is the only correct pairing — callers MUST keep
 * `theme` and `registry` together when reverse-mapping styles.
 */
export function createTestTheme(): TestThemeBundle {
  const registry = createTokenRegistry();
  const usedColors = new Set<string>();
  const numerics = makeNumericFactories();
  const strings = makeStringFactories();

  /** Registers `value` under `path`; tracks colors so we can detect collisions before they happen. */
  function reg(path: string, value: unknown): void {
    registry.register(path, value);
  }

  function color(path: string): string {
    const c = makeColorForPath(path, (k) => usedColors.has(k));
    usedColors.add(c);
    reg(path, c);
    return c;
  }

  // --- typography.families
  const families: Theme['typography']['families'] = {
    primary: strings.fontFamily('typography.families.primary'),
    secondary: strings.fontFamily('typography.families.secondary'),
    cursive: strings.fontFamily('typography.families.cursive'),
    monospace: strings.fontFamily('typography.families.monospace'),
    numeric: strings.fontFamily('typography.families.numeric'),
    sansSerif: strings.fontFamily('typography.families.sansSerif'),
    serif: strings.fontFamily('typography.families.serif'),
  };
  for (const k of Object.keys(families) as (keyof typeof families)[]) {
    reg(`typography.families.${k}`, families[k]);
  }

  // --- typography.sizes
  const sizesKeys = ['caption', 'secondary', 'body', 'subheader', 'header', 'hero', 'heroLarge'] as const;
  const sizes = {} as Theme['typography']['sizes'];
  for (const k of sizesKeys) {
    const v = numerics.size();
    sizes[k] = v;
    reg(`typography.sizes.${k}`, v);
  }

  // --- typography.weights
  // `FontWeightValue` is a narrow union of CSS strings + a few keywords.
  // We mint unique synthetic strings (`'w1'`, `'w2'`, ...) for token
  // uniqueness, then cast — RN treats the value opaquely at render
  // time and never validates the string.
  const weights = {
    regular: numerics.weight(),
    semiBold: numerics.weight(),
  } as unknown as Theme['typography']['weights'];
  for (const k of Object.keys(weights) as (keyof typeof weights)[]) {
    reg(`typography.weights.${k}`, weights[k]);
  }

  // --- typography.variants
  const v1Variants = [
    'captionStandard',
    'secondaryStandard',
    'secondarySemibold',
    'bodyStandard',
    'bodySemibold',
    'subheaderStandard',
    'subheaderSemibold',
    'headerStandard',
    'headerSemibold',
    'heroStandard',
    'heroSemibold',
    'heroLargeStandard',
    'heroLargeSemibold',
  ] as const;
  const v2Variants = [
    'caption1',
    'caption1Strong',
    'caption2',
    'body1',
    'body1Strong',
    'body2',
    'body2Strong',
    'subtitle1',
    'subtitle1Strong',
    'subtitle2',
    'subtitle2Strong',
    'title1',
    'title1Strong',
    'title2',
    'title3',
    'largeTitle',
    'display',
  ] as const;
  const variants = {} as Theme['typography']['variants'];
  for (const name of [...v1Variants, ...v2Variants]) {
    const face = strings.fontFamily(`typography.variants.${name}.face`);
    const size = numerics.size();
    const weight = numerics.weight();
    const lineHeight = numerics.lineHeight();
    const variant = { face, size, weight, lineHeight };
    reg(`typography.variants.${name}.face`, face);
    reg(`typography.variants.${name}.size`, size);
    reg(`typography.variants.${name}.weight`, weight);
    reg(`typography.variants.${name}.lineHeight`, lineHeight);
    // Object-level registration covers the case where consumers spread the
    // whole variant onto a style; the reverse-mapper will then see the
    // entire variant object as the value of (say) `style.font` and report
    // the variant path.
    reg(`typography.variants.${name}`, variant);
    // `Variants` is a strict-keys interface (no index signature), so we
    // route through `unknown` to assign each variant by its dynamic key.
    (variants as unknown as Record<string, typeof variant>)[name] = variant;
  }

  // --- spacing
  const spacing = {
    s2: strings.spacingPx(),
    s1: strings.spacingPx(),
    m: strings.spacingPx(),
    l1: strings.spacingPx(),
    l2: strings.spacingPx(),
  } as Theme['spacing'];
  for (const k of Object.keys(spacing) as (keyof typeof spacing)[]) {
    reg(`spacing.${k}`, spacing[k]);
  }

  // --- shadows
  const shadowKeys = [
    'shadow2',
    'shadow4',
    'shadow8',
    'shadow16',
    'shadow28',
    'shadow64',
    'shadow2brand',
    'shadow4brand',
    'shadow8brand',
    'shadow16brand',
    'shadow28brand',
    'shadow64brand',
  ] as const;
  const shadows = {} as Theme['shadows'];
  for (const name of shadowKeys) {
    const ambient = {
      x: numerics.shadowNumeric(),
      y: numerics.shadowNumeric(),
      blur: numerics.shadowNumeric(),
      color: color(`shadows.${name}.ambient.color`),
    };
    const key = {
      x: numerics.shadowNumeric(),
      y: numerics.shadowNumeric(),
      blur: numerics.shadowNumeric(),
      color: color(`shadows.${name}.key.color`),
    };
    reg(`shadows.${name}.ambient.x`, ambient.x);
    reg(`shadows.${name}.ambient.y`, ambient.y);
    reg(`shadows.${name}.ambient.blur`, ambient.blur);
    reg(`shadows.${name}.key.x`, key.x);
    reg(`shadows.${name}.key.y`, key.y);
    reg(`shadows.${name}.key.blur`, key.blur);
    shadows[name] = { ambient, key };
  }

  // --- colors
  // The Theme contract requires four base color keys; everything else is
  // an open-ended index signature. We register a wide set of common color
  // names so that real components (Button, Text, etc.) find sentinels at
  // their expected token paths.
  //
  // Source of these names: `Color.types.ts` (Palette + AliasColorTokens +
  // ControlColorTokens). We can't iterate a TypeScript interface at
  // runtime, so the list is maintained here. If a component looks up a
  // color we haven't registered, `theme.colors.X` returns `undefined` and
  // the resolved style omits the property — fine for the reverse-map,
  // since `undefined` has no token origin.
  const colorNames = [
    // Required
    'background',
    'bodyText',
    'subText',
    'disabledText',
    // Common palette / fabric web
    'black',
    'white',
    'red',
    'redDark',
    'themePrimary',
    'themeDarker',
    'themeDark',
    'themeDarkAlt',
    'themeSecondary',
    'themeTertiary',
    'themeLight',
    'themeLighter',
    'themeLighterAlt',
    'accent',
    'blackTranslucent40',
    'neutralDark',
    'neutralPrimary',
    'neutralPrimaryAlt',
    'neutralSecondary',
    'neutralSecondaryAlt',
    'neutralTertiary',
    'neutralTertiaryAlt',
    'neutralQuaternary',
    'neutralQuaternaryAlt',
    'neutralLight',
    'neutralLighter',
    'neutralLighterAlt',
    // Semantic background / divider
    'bodyStandoutBackground',
    'bodyFrameBackground',
    'bodyFrameDivider',
    'bodyTextChecked',
    'bodyDivider',
    'disabledBackground',
    'disabledBodyText',
    'focusBorder',
    'variantBorder',
    'errorText',
    'inputBorder',
    'inputBackground',
    'inputFocusBorderAlt',
    'inputText',
    'inputPlaceholderText',
    // Buttons
    'buttonBackground',
    'buttonBackgroundChecked',
    'buttonBackgroundHovered',
    'buttonBackgroundPressed',
    'buttonBackgroundDisabled',
    'buttonBorder',
    'buttonBorderFocused',
    'buttonBorderDisabled',
    'buttonText',
    'buttonTextHovered',
    'buttonTextChecked',
    'buttonTextPressed',
    'buttonTextDisabled',
    'buttonIcon',
    'primaryButtonBackground',
    'primaryButtonBackgroundHovered',
    'primaryButtonBackgroundPressed',
    'primaryButtonBackgroundDisabled',
    'primaryButtonBorder',
    'primaryButtonBorderFocused',
    'primaryButtonText',
    'primaryButtonTextHovered',
    'primaryButtonTextPressed',
    'primaryButtonTextDisabled',
    'accentButtonBackground',
    // Menus
    'menuBackground',
    'menuDivider',
    'menuIcon',
    'menuItemBackgroundHovered',
    'menuItemBackgroundPressed',
    'menuItemText',
    'menuItemTextHovered',
    'listHeaderBackgroundHovered',
    'listHeaderBackgroundPressed',
    'actionLink',
    'link',
    'linkHovered',
    'linkPressed',
    // Alias / v2 — foreground
    'neutralForeground1',
    'neutralForeground1Hover',
    'neutralForeground1Pressed',
    'neutralForeground1Selected',
    'neutralForeground2',
    'neutralForeground3',
    'neutralForeground4',
    'neutralForegroundDisabled',
    'neutralForegroundDisabled1',
    'neutralForegroundDisabled2',
    'neutralForegroundOnColor',
    'neutralForegroundOnBrand',
    'neutralForegroundInverted',
    'brandForegroundLink',
    'brandForegroundLinkHover',
    'brandForegroundLinkPressed',
    'brandForegroundLinkSelected',
    'compoundBrandForeground1',
    'brandForeground1',
    'brandForeground1Pressed',
    'brandForeground1Selected',
    'brandForeground2',
    'brandForegroundTint',
    'brandForegroundDisabled1',
    'brandForegroundDisabled2',
    // Alias / v2 — background
    'neutralBackground1',
    'neutralBackground1Hover',
    'neutralBackground1Pressed',
    'neutralBackground1Selected',
    'neutralBackground2',
    'neutralBackground3',
    'neutralBackground4',
    'neutralBackground5',
    'neutralBackground6',
    'neutralBackgroundInverted',
    'neutralBackgroundDisabled',
    'brandBackground',
    'brandBackgroundHover',
    'brandBackgroundPressed',
    'brandBackgroundDisabled',
    'brandBackgroundSelected',
    'brandBackground2',
    'brandBackground3',
    'brandBackgroundStatic',
    'brandBackgroundTint',
    'compoundBrandBackground1',
    'compoundBrandBackground1Hover',
    'compoundBrandBackground1Pressed',
    // Alias / v2 — stroke
    'neutralStrokeAccessible',
    'neutralStroke1',
    'neutralStroke2',
    'neutralStroke3',
    'neutralStrokeDisabled',
    'brandStroke1',
    'brandStroke1Pressed',
    'brandStroke1Selected',
    'brandStroke2',
    'compoundBrandStroke1',
    'strokeFocus1',
    'strokeFocus2',
    'transparentStroke',
    // Control color tokens (deprecated but components still reach for them)
    'defaultBackground',
    'defaultBorder',
    'defaultContent',
    'defaultIcon',
    'defaultHoveredBackground',
    'defaultHoveredBorder',
    'defaultHoveredContent',
    'defaultHoveredIcon',
    'defaultFocusedBackground',
    'defaultFocusedBorder',
    'defaultFocusedContent',
    'defaultFocusedIcon',
    'defaultPressedBackground',
    'defaultPressedBorder',
    'defaultPressedContent',
    'defaultPressedIcon',
    'defaultDisabledBackground',
    'defaultDisabledBorder',
    'defaultDisabledContent',
    'defaultDisabledIcon',
    'ghostBackground',
    'ghostBorder',
    'ghostContent',
    'ghostIcon',
    'ghostHoveredBackground',
    'ghostHoveredBorder',
    'ghostHoveredContent',
    'ghostHoveredIcon',
    'ghostFocusedBackground',
    'ghostFocusedBorder',
    'ghostFocusedContent',
    'ghostFocusedIcon',
    'ghostPressedBackground',
    'ghostPressedBorder',
    'ghostPressedContent',
    'ghostPressedIcon',
    'ghostDisabledBackground',
    'ghostDisabledBorder',
    'ghostDisabledContent',
    'ghostDisabledIcon',
    // Status colors
    'dangerBackground1',
    'dangerBackground2',
    'dangerForeground1',
    'dangerForeground2',
    'dangerStroke1',
    'successBackground1',
    'successBackground2',
    'successForeground1',
    'successForeground2',
    'successStroke1',
    'warningBackground1',
    'warningBackground2',
    'warningForeground1',
    'warningForeground2',
    'warningStroke1',
    'severeBackground1',
    'severeBackground2',
    'severeForeground1',
    'severeForeground2',
    'severeStroke1',
  ];
  const colors = {} as Theme['colors'];
  for (const name of colorNames) {
    colors[name] = color(`colors.${name}`);
  }

  const theme: Theme = {
    name: 'analyzer-test-theme',
    colors,
    typography: { families, sizes, weights, variants },
    shadows,
    spacing,
    components: createComponentsProxy(),
    host: { appearance: 'light' },
  };

  return { theme, registry };
}
