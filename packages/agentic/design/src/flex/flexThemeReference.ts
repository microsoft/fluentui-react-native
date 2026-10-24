import { immutableMerge } from '@fluentui-react-native/framework-base';

import { defaultFlexTokenDescription } from './defaults/defaultTokens';
import { mergeFlexTokenDescription } from './flexTokenDescription';
import type { FlexTokenDescription, FlexTokens, PartialFlexTokens } from './tokens.types';
import { resolveFlexTokenDescription } from './colors/interactionPolicy';
import { internResolvedThemeAppearance, themeAppearanceKey } from '../theming/appearance';
import type {
  NormalizedThemeAppearance,
  ResolvedThemeAppearance,
  ThemeAppearanceOptions,
  ThemeAppearanceSource,
} from '../types/appearance.types';
import type { FlexThemeSource, OnThemeChange } from '../theming/themeSource';
import type { PartialTheme, Theme } from '../fluent/types/Theme.types';

/**
 * Authored base tokens layered over the package defaults. Resolved
 * `FlexTokens` are appearance-bound outputs and are not accepted.
 */
export type FlexThemeInput = PartialFlexTokens | ((appearance: Readonly<NormalizedThemeAppearance>) => PartialFlexTokens);

/**
 * Authored overrides, or a function of the accumulated authored description
 * and the appearance that returns overrides. Use `selectColorEntry` to read an
 * appearance-specific authored color.
 */
export type FlexThemeRecipe =
  | PartialFlexTokens
  | ((description: FlexTokenDescription, appearance: Readonly<NormalizedThemeAppearance>) => PartialFlexTokens);

export type LegacyThemeFallback = Theme | PartialTheme | ((appearance: Readonly<NormalizedThemeAppearance>) => Theme | PartialTheme);

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
  private readonly descriptionsByAppearance = new Map<string, FlexTokenDescription>();
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

  /**
   * Resolve the tokens for one appearance. A missing tone means cool. Omitted
   * interactive hover and pressed values are computed from rest on first read.
   */
  public resolveFlexTokens(requestedAppearance: ResolvedThemeAppearance): FlexTokens {
    this.syncParentRevision();
    const appearance = internResolvedThemeAppearance(requestedAppearance);
    const key = themeAppearanceKey(appearance);
    const cached = this.tokensByAppearance.get(key);
    if (cached) {
      return cached;
    }

    const tokens = resolveFlexTokenDescription(this.resolveDescription(appearance, key), appearance);
    this.tokensByAppearance.set(key, tokens);
    return tokens;
  }

  public resolveLegacyFallback(requestedAppearance: ResolvedThemeAppearance): Theme | PartialTheme | undefined {
    const appearance = internResolvedThemeAppearance(requestedAppearance);
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
    this.descriptionsByAppearance.clear();
    this.tokensByAppearance.clear();
    for (const listener of this.listeners) {
      listener();
    }
  }

  public update(...recipes: FlexThemeRecipe[]): void {
    this.recipes = recipes;
    this.invalidate();
  }

  // Parents supply authored descriptions, never appearance-bound resolved tokens.
  private resolveDescription(appearance: Readonly<NormalizedThemeAppearance>, key: string): FlexTokenDescription {
    const cached = this.descriptionsByAppearance.get(key);
    if (cached) {
      return cached;
    }

    let description = this.resolveBaseDescription(appearance, key);
    for (const recipe of this.recipes) {
      description = mergeFlexTokenDescription(description, typeof recipe === 'function' ? recipe(description, appearance) : recipe);
    }
    this.descriptionsByAppearance.set(key, description);
    return description;
  }

  private resolveBaseDescription(appearance: Readonly<NormalizedThemeAppearance>, key: string): FlexTokenDescription {
    if (this.base instanceof FlexThemeReference) {
      this.base.syncParentRevision();
      return this.base.resolveDescription(appearance, key);
    }
    const base = typeof this.base === 'function' ? this.base(appearance) : this.base;
    return mergeFlexTokenDescription(defaultFlexTokenDescription, base);
  }

  private syncParentRevision(): void {
    if (this.base instanceof FlexThemeReference && this.parentRevision !== this.base.revision) {
      this.parentRevision = this.base.revision;
      this.invalidate();
    }
  }
}
