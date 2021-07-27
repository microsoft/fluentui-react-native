import { createThemingModuleHelper } from './ThemingModuleHelpers';
import { getThemingModule } from '@fluentui-react-native/win32-theme';

export const ThemingModuleHelper = createThemingModuleHelper(...getThemingModule());
