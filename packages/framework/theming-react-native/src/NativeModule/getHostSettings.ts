import { ITheme } from '../Theme.types';
import { IHostSettingsWin32 } from './ThemingModule.types';

export function getHostSettingsWin32(theme: ITheme): IHostSettingsWin32 | undefined {
  if (theme['host'] && theme['host'].palette) {
    return theme['host'];
  }
  return undefined;
}
