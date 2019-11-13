import { makeMockThemingModuleHelper } from './MockThemingModule';
import { EventEmitter } from 'events';
import { getBaselinePlatformTheme } from '../BaselinePlatformDefaults';

export const ThemingModuleHelper = makeMockThemingModuleHelper(new EventEmitter(), undefined, {
  getPlatformDefaults: getBaselinePlatformTheme
});
