import { immutableMerge } from '@fluentui-react-native/framework-base';

import { defaultFlexTokens } from '../tokens/defaultTokens';
import type {
  FlexTokens,
  InteractiveColorOverrides,
  SemanticBorderRadii,
  SemanticColorTokenValues,
  SemanticFontFamilies,
  SemanticFontSizes,
  SemanticFontWeights,
  SemanticLineHeights,
  SemanticShadows,
  SemanticSpacing,
  SemanticStrokeWidths,
} from '../tokens/flex.types';
import { themeAppearanceKey } from './appearance';
import type { ResolvedThemeAppearance, ThemeAppearanceOptions, ThemeAppearanceSource } from './appearance.types';
import type { FlexThemeSource, OnThemeChange } from './themeSource';
import type { PartialTheme, Theme } from './types/Theme.types';

export type PartialFlexTokens = {
  color?: Partial<SemanticColorTokenValues> & {
    hover?: Partial<InteractiveColorOverrides>;
    pressed?: Partial<InteractiveColorOverrides>;
  };
  shadow?: Partial<SemanticShadows>;
  fontWeight?: Partial<SemanticFontWeights>;
  fontFamily?: Partial<SemanticFontFamilies>;
  fontSize?: Partial<SemanticFontSizes>;
  lineHeight?: Partial<SemanticLineHeights>;
  borderRadius?: Partial<SemanticBorderRadii>;
  spacing?: Partial<SemanticSpacing>;
  strokeWidth?: Partial<SemanticStrokeWidths>;
};

export type FlexThemeInput = FlexTokens | PartialFlexTokens | ((appearance: ResolvedThemeAppearance) => FlexTokens | PartialFlexTokens);

export type FlexThemeRecipe = PartialFlexTokens | ((parent: FlexTokens, appearance: ResolvedThemeAppearance) => PartialFlexTokens);

export type LegacyThemeFallback = Theme | PartialTheme | ((appearance: ResolvedThemeAppearance) => Theme | PartialTheme);

export interface FlexThemeReferenceOptions {
  base?: FlexThemeInput | FlexThemeReference;
  appearance?: ThemeAppearanceOptions;
  fallbackAppearance?: Partial<ResolvedThemeAppearance>;
  appearanceSource?: ThemeAppearanceSource;
  legacyFallback?: LegacyThemeFallback;
}

export class FlexThemeReference implements FlexThemeSource {
  public readonly kind = 'flex';
  public readonly appearanceOptions?: ThemeAppearanceOptions;
  public readonly fallbackAppearance?: Partial<ResolvedThemeAppearance>;
  public readonly appearanceSource?: ThemeAppearanceSource;

  private revisionValue = 0;
  private readonly base?: FlexThemeInput | FlexThemeReference;
  private readonly legacyFallback?: LegacyThemeFallback;
  private recipes: FlexThemeRecipe[];
  private readonly listeners = new Set<OnThemeChange>();
  private readonly tokensByAppearance = new Map<string, FlexTokens>();
  private parentListener?: OnThemeChange;
  private parentRevision?: number;

  public constructor(options: FlexThemeReferenceOptions = {}, ...recipes: FlexThemeRecipe[]) {
    this.base = options.base;
    const parent = options.base instanceof FlexThemeReference ? options.base : undefined;
    this.appearanceOptions = options.appearance ?? parent?.appearanceOptions;
    this.fallbackAppearance = options.fallbackAppearance ?? parent?.fallbackAppearance;
    this.appearanceSource = options.appearanceSource ?? parent?.appearanceSource;
    this.legacyFallback = options.legacyFallback;
    this.recipes = recipes;
    this.parentRevision = parent?.revision;
  }

  public get revision(): number {
    this.syncParentRevision();
    return this.revisionValue;
  }

  public resolveFlexTokens(appearance: ResolvedThemeAppearance): FlexTokens {
    this.syncParentRevision();
    const key = themeAppearanceKey(appearance);
    const cached = this.tokensByAppearance.get(key);
    if (cached) {
      return cached;
    }

    let tokens = this.resolveBase(appearance);
    for (const recipe of this.recipes) {
      tokens = immutableMerge(tokens, typeof recipe === 'function' ? recipe(tokens, appearance) : recipe);
    }
    tokens = { ...tokens };
    this.tokensByAppearance.set(key, tokens);
    return tokens;
  }

  public resolveLegacyFallback(appearance: ResolvedThemeAppearance): Theme | PartialTheme | undefined {
    const parentFallback = this.base instanceof FlexThemeReference ? this.base.resolveLegacyFallback(appearance) : undefined;
    const fallback = typeof this.legacyFallback === 'function' ? this.legacyFallback(appearance) : this.legacyFallback;
    return parentFallback && fallback ? immutableMerge(parentFallback, fallback) : (fallback ?? parentFallback);
  }

  public addOnThemeChanged(listener: OnThemeChange): void {
    this.listeners.add(listener);
    if (this.listeners.size === 1 && this.base instanceof FlexThemeReference) {
      this.parentListener = () => {
        this.parentRevision = this.base instanceof FlexThemeReference ? this.base.revision : undefined;
        this.invalidate();
      };
      this.base.addOnThemeChanged(this.parentListener);
    }
  }

  public removeOnThemeChanged(listener: OnThemeChange): void {
    this.listeners.delete(listener);
    if (this.listeners.size === 0 && this.parentListener && this.base instanceof FlexThemeReference) {
      this.base.removeOnThemeChanged(this.parentListener);
      this.parentListener = undefined;
    }
  }

  public invalidate(): void {
    this.revisionValue += 1;
    this.tokensByAppearance.clear();
    for (const listener of this.listeners) {
      listener();
    }
  }

  public update(...recipes: FlexThemeRecipe[]): void {
    this.recipes = recipes;
    this.invalidate();
  }

  private resolveBase(appearance: ResolvedThemeAppearance): FlexTokens {
    if (this.base instanceof FlexThemeReference) {
      return this.base.resolveFlexTokens(appearance);
    }
    const base = typeof this.base === 'function' ? this.base(appearance) : this.base;
    return base ? immutableMerge(defaultFlexTokens, base) : defaultFlexTokens;
  }

  private syncParentRevision(): void {
    if (this.base instanceof FlexThemeReference && this.parentRevision !== this.base.revision) {
      this.parentRevision = this.base.revision;
      this.invalidate();
    }
  }
}
