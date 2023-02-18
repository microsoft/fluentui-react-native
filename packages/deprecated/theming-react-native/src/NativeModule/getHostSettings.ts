import type { ITheme } from '../Theme.types';

/**
 * @deprecated
 */
export function getHostSettingsWin32(theme: ITheme): ITheme['host'] | undefined {
  return theme.host?.palette ? theme.host : undefined;
}
