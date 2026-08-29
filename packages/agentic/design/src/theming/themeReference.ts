import type { Theme, PartialTheme } from './index';

import { appearanceOptionsFromLegacy, resolveThemeAppearance, themeAppearanceKey } from './appearance';
import type { ResolvedThemeAppearance, ThemeAppearanceOptions, ThemeAppearanceSource } from './appearance.types';
import { mergeTheme } from './mergeTheme';
import { platformAppearance } from './platformAppearance';
import type { LegacyThemeSource, OnThemeChange } from './themeSource';

export type { OnThemeChange } from './themeSource';

/**
 * A function that takes in a parent theme, then returns a partial set of changes to be merged with the parent theme to update
 * it.
 */
export type ThemeTransform<TTheme extends Theme, TPartial extends PartialTheme> = (
  parent: TTheme,
  appearance?: ResolvedThemeAppearance,
) => TPartial;

/**
 * A theme recipe is either a partial theme to merge on top of a base theme, or a function that returns the same kind of
 * partial to merge. These are recipes because they are cached as distinct steps so that they can be reapplied if the
 * base theme changes
 */
export type ThemeRecipe<TTheme extends Theme, TPartial extends PartialTheme> = TPartial | ThemeTransform<TTheme, TPartial>;

export interface ThemeReferenceOptions<TTheme extends Theme, TPartial extends PartialTheme> {
  base: TTheme | ThemeReference<TTheme, TPartial>;
  recipes?: readonly ThemeRecipe<TTheme, TPartial>[];
  appearance?: ThemeAppearanceOptions;
  getAppearance?: () => ThemeAppearanceOptions | undefined;
  fallbackAppearance?: Partial<ResolvedThemeAppearance>;
  getFallbackAppearance?: () => Partial<ResolvedThemeAppearance> | undefined;
  appearanceSource?: ThemeAppearanceSource;
  alwaysSubscribeToAppearanceSource?: boolean;
}

function isThemeReferenceOptions<TTheme extends Theme, TPartial extends PartialTheme>(
  value: TTheme | ThemeReference<TTheme, TPartial> | ThemeReferenceOptions<TTheme, TPartial>,
): value is ThemeReferenceOptions<TTheme, TPartial> {
  return typeof value === 'object' && value !== null && 'base' in value && !('host' in value);
}

/**
 * Provides a wrapper around a theme object, allowing the ability to create a theme from another theme, to listen to theme
 * changes, and to update the theme.
 *
 * This is the object that is designed to be handed to a theme provider, such that it can listen for changes and set the
 * value into context again.
 */
export class ThemeReference<TTheme extends Theme = Theme, TPartial extends PartialTheme = PartialTheme> implements LegacyThemeSource {
  public readonly kind = 'legacy';
  public readonly appearanceSource?: ThemeAppearanceSource;

  private revisionValue = 0;
  private themeData: TTheme | undefined = undefined;
  private themeDataAppearanceKey: string | undefined;
  private readonly themesByAppearance = new Map<string, TTheme>();
  private recipes: ThemeRecipe<TTheme, TPartial>[];
  private readonly listeners = new Set<OnThemeChange>();
  private getParent: () => TTheme;
  private getParentForAppearance: (appearance: ResolvedThemeAppearance) => TTheme;
  private parentRef: ThemeReference<TTheme, TPartial> | undefined = undefined;
  private parentListener?: OnThemeChange;
  private parentRevision?: number;
  private legacyAppearanceUnsubscribe?: () => void;
  private readonly getAppearanceOptions: () => ThemeAppearanceOptions | undefined;
  private readonly getFallbackAppearance: () => Partial<ResolvedThemeAppearance> | undefined;
  private readonly alwaysSubscribeToAppearanceSource: boolean;

  /**
   * Create the theme reference, either as a plain wrapper, or a wrapper with additional transforms and/or merging
   * @param base - can be either another ThemeReference object, or a fully specified theme
   * @param recipes - any number of recipes to be applied on top of the theme object
   */
  constructor(
    base: TTheme | ThemeReference<TTheme, TPartial> | ThemeReferenceOptions<TTheme, TPartial>,
    ...recipes: ThemeRecipe<TTheme, TPartial>[]
  ) {
    const options = isThemeReferenceOptions(base) ? base : undefined;
    const resolvedBase = options?.base ?? (base as TTheme | ThemeReference<TTheme, TPartial>);
    this.recipes = options?.recipes ? [...options.recipes] : recipes;
    this.parentRef = resolvedBase instanceof ThemeReference ? resolvedBase : undefined;
    const baseAppearance = this.parentRef
      ? () => this.parentRef?.appearanceOptions
      : () => appearanceOptionsFromLegacy((resolvedBase as TTheme).host.appearance);
    this.getAppearanceOptions = options?.getAppearance
      ? () => options.getAppearance?.() ?? baseAppearance()
      : options?.appearance
        ? () => options.appearance
        : baseAppearance;
    const baseFallbackAppearance = () => this.parentRef?.fallbackAppearance;
    this.getFallbackAppearance = options?.getFallbackAppearance
      ? () => options.getFallbackAppearance?.() ?? baseFallbackAppearance()
      : options?.fallbackAppearance
        ? () => options.fallbackAppearance
        : baseFallbackAppearance;
    this.appearanceSource = options?.appearanceSource ?? this.parentRef?.appearanceSource ?? platformAppearance;
    this.alwaysSubscribeToAppearanceSource =
      options?.alwaysSubscribeToAppearanceSource ?? this.parentRef?.alwaysSubscribeToAppearanceSource ?? false;
    this.parentRevision = this.parentRef?.revision;
    this.getParent = () => (this.parentRef ? this.parentRef.theme : (resolvedBase as TTheme));
    this.getParentForAppearance = (appearance) => (this.parentRef ? this.parentRef.resolveTheme(appearance) : (resolvedBase as TTheme));
  }

  public get appearanceOptions(): ThemeAppearanceOptions | undefined {
    return this.getAppearanceOptions();
  }

  public get fallbackAppearance(): Partial<ResolvedThemeAppearance> | undefined {
    return this.getFallbackAppearance();
  }

  public get revision(): number {
    this.syncParentRevision();
    return this.revisionValue;
  }

  /**
   * get the internal theme object, which will be created on-demand
   */
  public get theme(): TTheme {
    this.syncParentRevision();
    const appearance = resolveThemeAppearance(
      this.appearanceOptions,
      this.appearanceSource?.getSnapshot(),
      this.fallbackAppearance,
    ).resolved;
    const appearanceKey = themeAppearanceKey(appearance);
    if (appearanceKey !== this.themeDataAppearanceKey) {
      this.themeData = undefined;
      this.themeDataAppearanceKey = appearanceKey;
    }
    if (!this.themeData) {
      let theme = this.getParent();
      for (const recipe of this.recipes) {
        theme = mergeTheme(theme, typeof recipe === 'function' ? recipe(theme, appearance) : recipe);
      }
      this.themeData = theme;
    }
    return this.themeData;
  }

  /**
   * Resolve the legacy Theme for one concrete appearance. Repeated resolutions
   * share identity until this reference is invalidated.
   */
  public resolveTheme(appearance: ResolvedThemeAppearance): TTheme {
    this.syncParentRevision();
    const key = themeAppearanceKey(appearance);
    const cached = this.themesByAppearance.get(key);
    if (cached) {
      return cached;
    }

    let theme = this.getParentForAppearance(appearance);
    for (const recipe of this.recipes) {
      theme = mergeTheme(theme, typeof recipe === 'function' ? recipe(theme, appearance) : recipe);
    }

    // A new root is required for downstream caches keyed by Theme identity.
    theme = { ...theme };
    this.themesByAppearance.set(key, theme);
    return theme;
  }

  /**
   * register a new listener for theme changes
   */
  public addOnThemeChanged(listener: OnThemeChange): void {
    this.listeners.add(listener);
    if (this.listeners.size === 1) {
      this.subscribeLegacyAppearance();
    }
    if (this.listeners.size === 1 && this.parentRef) {
      this.parentListener = () => {
        const nextParentRevision = this.parentRef?.revision;
        if (nextParentRevision !== this.parentRevision) {
          this.parentRevision = nextParentRevision;
          this.invalidate();
        } else {
          this.themeData = undefined;
          this.themeDataAppearanceKey = undefined;
          for (const childListener of this.listeners) {
            childListener();
          }
        }
      };
      this.parentRef.addOnThemeChanged(this.parentListener);
    }
  }

  /**
   * remove a previously registered listener
   */
  public removeOnThemeChanged(listener: OnThemeChange): void {
    this.listeners.delete(listener);
    if (this.listeners.size === 0 && this.parentListener && this.parentRef) {
      this.parentRef.removeOnThemeChanged(this.parentListener);
      this.parentListener = undefined;
    }
    if (this.listeners.size === 0 && this.legacyAppearanceUnsubscribe) {
      this.legacyAppearanceUnsubscribe();
      this.legacyAppearanceUnsubscribe = undefined;
    }
  }

  /**
   * invalidate the theme, causing it to be regenerated. This can happen via notifications from the parent, but
   * can also be called directly if a functional transform needs to be re-run
   */
  public invalidate(): void {
    this.revisionValue += 1;
    this.themeData = undefined;
    this.themeDataAppearanceKey = undefined;
    this.themesByAppearance.clear();
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * update the recipes (but not the base) in the theme. This will also implicitly invalidate the theme
   * since the recipes changed.
   */
  public update(...recipes: ThemeRecipe<TTheme, TPartial>[]): void {
    this.recipes = recipes || [];
    this.invalidate();
  }

  private syncParentRevision(): void {
    if (this.parentRef && this.parentRevision !== this.parentRef.revision) {
      this.parentRevision = this.parentRef.revision;
      this.invalidate();
    }
  }

  private subscribeLegacyAppearance(): void {
    const shouldSubscribe = this.alwaysSubscribeToAppearanceSource || Object.values(this.appearanceOptions ?? {}).includes('system');
    if (!this.legacyAppearanceUnsubscribe && this.appearanceSource && shouldSubscribe) {
      this.legacyAppearanceUnsubscribe = this.appearanceSource.subscribe(() => {
        this.themeData = undefined;
        this.themeDataAppearanceKey = undefined;
        for (const listener of this.listeners) {
          listener();
        }
      });
    }
  }
}
