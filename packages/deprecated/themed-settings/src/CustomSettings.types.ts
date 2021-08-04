import { IComponentSettings } from '@uifabricshared/foundation-settings';

/**
 * A function which takes a theme and produces a settings object.  Used as one of the inputs for customization.
 */
export type ISettingsFromTheme<TSettings extends IComponentSettings, TTheme> = (theme: TTheme) => TSettings;

/**
 * A unit if settings customization.  This can either be a settings object itself, a string denoting a name to look up in a theme,
 * or a settings from theme function.  The types string | function | object allow for easy disambiguation.
 */
export type ISettingsEntry<TSettings extends IComponentSettings, TTheme> = TSettings | string | ISettingsFromTheme<TSettings, TTheme>;

/**
 * A function which retrieves a setting definition from a theme by name.  This is separate to allow the theming system
 * to be injected.
 */
export type IGetSettingsFromTheme<TSettings extends IComponentSettings, TTheme> = (theme: TTheme, name: string) => TSettings | undefined;
