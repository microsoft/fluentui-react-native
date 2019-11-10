import { createMockThemingModuleInfo } from './MockThemingModule';
import { EventEmitter } from 'events';
import { getBaselinePlatformTheme } from '../BaselinePlatformDefaults';

export const ThemingModuleHelper = createMockThemingModuleInfo(new EventEmitter(), undefined, {
  getPlatformDefaults: getBaselinePlatformTheme
});
