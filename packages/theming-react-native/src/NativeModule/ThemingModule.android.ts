import { createMockThemingModuleInfo } from './MockThemingModule';
import { NativeEventEmitter } from 'react-native';

export const ThemingModuleHelper = createMockThemingModuleInfo(new NativeEventEmitter());
