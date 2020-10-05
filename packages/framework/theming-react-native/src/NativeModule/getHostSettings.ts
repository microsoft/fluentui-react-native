import { ITheme } from '../Theme.types';

export function getHostSettingsWin32(theme: ITheme): ITheme['host'] | undefined {
  return theme.host?.palette ? theme.host : undefined;
}
