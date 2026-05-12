import type { Theme } from '@fluentui-react-native/theme-types';
import {
  COLOR_TOKEN_NAMES,
  SHADOW_TOKEN_NAMES,
  SPACING_TOKEN_NAMES,
  TYPOGRAPHY_FAMILY_NAMES,
  TYPOGRAPHY_SIZE_NAMES,
  TYPOGRAPHY_VARIANT_NAMES,
  TYPOGRAPHY_WEIGHT_NAMES,
} from '@fluentui-react-native/theme-types/metadata';

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
/**
 * Options for {@link createTestTheme}. Currently just the `appearance`
 * setting, which is wired straight through to `theme.host.appearance`.
 * Components that branch on light/dark theming can be tested in both
 * modes by toggling this option.
 */
export interface CreateTestThemeOptions {
  appearance?: 'light' | 'dark';
}

export function createTestTheme(options: CreateTestThemeOptions = {}): TestThemeBundle {
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

  // The token-name tuples imported from `@fluentui-react-native/theme-types/metadata`
  // are the single source of truth for every group below. Adding a token to
  // a type in `theme-types` flows into the test theme automatically once
  // the metadata tuple is updated; parity tests in `theme-types` guard
  // against tuple/type drift.

  // --- typography.families
  const families = {} as Theme['typography']['families'];
  for (const k of TYPOGRAPHY_FAMILY_NAMES) {
    families[k] = strings.fontFamily(`typography.families.${k}`);
    reg(`typography.families.${k}`, families[k]);
  }

  // --- typography.sizes
  const sizes = {} as Theme['typography']['sizes'];
  for (const k of TYPOGRAPHY_SIZE_NAMES) {
    const v = numerics.size();
    sizes[k] = v;
    reg(`typography.sizes.${k}`, v);
  }

  // --- typography.weights
  // `FontWeightValue` is a narrow union of CSS strings + a few keywords.
  // We mint unique synthetic strings (`'w1'`, `'w2'`, ...) for token
  // uniqueness, then cast — RN treats the value opaquely at render
  // time and never validates the string.
  // `FontWeights` is a strict-keys interface with no index signature, so
  // we route the dynamic-key writes through `unknown` (same trick used for
  // the variants assignment below).
  const weights = {} as unknown as Theme['typography']['weights'];
  const weightsWritable = weights as unknown as Record<string, unknown>;
  for (const k of TYPOGRAPHY_WEIGHT_NAMES) {
    const value = numerics.weight();
    weightsWritable[k] = value;
    reg(`typography.weights.${k}`, value);
  }

  // --- typography.variants
  const variants = {} as Theme['typography']['variants'];
  for (const name of TYPOGRAPHY_VARIANT_NAMES) {
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
  const spacing = {} as Theme['spacing'];
  for (const k of SPACING_TOKEN_NAMES) {
    spacing[k] = strings.spacingPx();
    reg(`spacing.${k}`, spacing[k]);
  }

  // --- shadows
  const shadows = {} as Theme['shadows'];
  for (const name of SHADOW_TOKEN_NAMES) {
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
  // The Theme contract requires four base color keys (background, bodyText,
  // subText, disabledText); everything else is an open-ended index
  // signature. We iterate `COLOR_TOKEN_NAMES` to register a sentinel for
  // every key declared across PaletteTextColors / PaletteBackgroundColors
  // / ControlColorTokens / AliasColorTokens. The four required keys are
  // included in that union, so the resulting `colors` object satisfies
  // `ThemeColorDefinition` without us listing them separately.
  const colors = {} as Theme['colors'];
  for (const name of COLOR_TOKEN_NAMES) {
    colors[name] = color(`colors.${name}`);
  }

  const theme: Theme = {
    name: 'analyzer-test-theme',
    colors,
    typography: { families, sizes, weights, variants },
    shadows,
    spacing,
    components: createComponentsProxy(),
    host: { appearance: options.appearance ?? 'light' },
  };

  return { theme, registry };
}
