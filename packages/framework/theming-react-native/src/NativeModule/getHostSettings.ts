import { ITheme } from '../Theme.types';
import { IHostSettingsWin32 } from './ThemingModule.types';

export function getHostSettingsWin32(theme: ITheme): IHostSettingsWin32 | undefined {
  if (theme['host'] && (theme['host'] as Partial<IHostSettingsWin32>).palette) {
    return theme['host'] as IHostSettingsWin32;
  }
  return undefined;
}
