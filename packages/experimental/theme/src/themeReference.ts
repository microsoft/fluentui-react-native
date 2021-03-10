import { Theme, PartialTheme } from '@fluentui-react-native/theme-types';
import { mergeTheme } from './mergeTheme';

/**
 * Argument type for listening for theme changes
 */
export type OnThemeChange = () => void;

/**
 * A function that takes in a parent theme, then returns a partial set of changes to be merged with the parent theme to update
 * it.
 */
export type ThemeTransform<TTheme extends Theme, TPartial extends PartialTheme> = (parent: TTheme) => TPartial;

/**
 * A theme recipe is either a partial theme to merge on top of a base theme, or a function that returns the same kind of
 * partial to merge. These are recipes because they are cached as distinct steps so that they can be reapplied if the
 * base theme changes
 */
export type ThemeRecipe<TTheme extends Theme, TPartial extends PartialTheme> = TPartial | ThemeTransform<TTheme, TPartial>;

/**
 * Provides a wrapper around a theme object, allowing the ability to create a theme from another theme, to listen to theme
 * changes, and to update the theme.
 *
 * This is the object that is designed to be handed to a theme provider, such that it can listen for changes and set the
 * value into context again.
 */
export class ThemeReference<TTheme extends Theme = Theme, TPartial extends PartialTheme = PartialTheme> {
  private themeData: TTheme | undefined = undefined;
  private recipes: ThemeRecipe<TTheme, TPartial>[];
  private listeners: OnThemeChange[] = [];
  private getParent: () => TTheme;
  private parentRef: ThemeReference<TTheme, TPartial> | undefined = undefined;

  /**
   * Create the theme reference, either as a plain wrapper, or a wrapper with additional transforms and/or merging
   * @param base - can be either another ThemeReference object, or a fully specified theme
   * @param recipes - any number of recipes to be applied on top of the theme object
   */
  constructor(base: TTheme | ThemeReference<TTheme, TPartial>, ...recipes: ThemeRecipe<TTheme, TPartial>[]) {
    this.listeners = [];
    this.recipes = recipes;
    this.parentRef = base instanceof ThemeReference ? base : undefined;
    if (this.parentRef) {
      const onChanged = () => {
        this.invalidate();
      };
      this.parentRef.addOnThemeChanged(onChanged);
    }
    this.getParent = () => (this.parentRef ? this.parentRef.theme : (base as TTheme));
  }

  /**
   * get the internal theme object, which will be created on-demand
   */
  public get theme(): TTheme {
    if (!this.themeData) {
      let theme = this.getParent();
      for (const recipe of this.recipes) {
        theme = mergeTheme(theme, typeof recipe === 'function' ? recipe(theme) : recipe);
      }
      this.themeData = theme;
    }
    return this.themeData;
  }

  /**
   * register a new listener for theme changes
   */
  public addOnThemeChanged(listener: OnThemeChange): void {
    this.listeners.push(listener);
  }

  /**
   * remove a previously registered listener
   */
  public removeOnThemeChanged(listener: OnThemeChange): void {
    this.listeners = this.listeners.filter((v) => v !== listener);
  }

  /**
   * invalidate the theme, causing it to be regenerated. This can happen via notifications from the parent, but
   * can also be called directly if a functional transform needs to be re-run
   */
  public invalidate(): void {
    this.themeData = undefined;
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
}
