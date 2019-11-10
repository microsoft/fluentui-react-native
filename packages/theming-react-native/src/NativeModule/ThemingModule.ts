import { createMockThemingModuleInfo } from './MockThemingModule';
import { EventEmitter } from 'events';

export const ThemingModuleHelper = createMockThemingModuleInfo(new EventEmitter());
