import { IComponentSettings } from '@uifabric/foundation-settings';

export type ISettingsFromTheme<TSettings extends IComponentSettings, TTheme> = (theme: TTheme) => TSettings;

export type ISettingsEntry<TSettings extends IComponentSettings, TTheme> = TSettings | string | ISettingsFromTheme<TSettings, TTheme>;

export type IGetSettingsFromTheme<TSettings extends IComponentSettings, TTheme> = (theme: TTheme, name: string) => TSettings | undefined;
