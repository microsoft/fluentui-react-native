import { makeMockThemingModuleHelper } from './MockThemingModule';
import { NativeEventEmitter } from 'react-native';

export const ThemingModuleHelper = makeMockThemingModuleHelper(new NativeEventEmitter());
