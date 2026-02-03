import type { IViewProps } from '@fluentui-react-native/adapters';
import type { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps } from 'react-native';

export type Material =
  | 'titlebar'
  | 'selection'
  | 'menu'
  | 'popover'
  | 'sidebar'
  | 'headerview'
  | 'sheet'
  | 'windowbackground'
  | 'hudWindow'
  | 'fullScreenUI'
  | 'toolTip'
  | 'contentBackground'
  | 'underWindowBackground'
  | 'underPageBackground';

export interface NativeProps extends ViewProps {
  material?: WithDefault<
    | 'titlebar'
    | 'selection'
    | 'menu'
    | 'popover'
    | 'sidebar'
    | 'headerview'
    | 'sheet'
    | 'windowbackground'
    | 'hudWindow'
    | 'fullScreenUI'
    | 'toolTip'
    | 'contentBackground'
    | 'underWindowBackground'
    | 'underPageBackground',
    'menu'
  >;
  blendingMode?: WithDefault<'behindWindow' | 'withinWindow', 'behindWindow'>;
  state?: WithDefault<'followsWindowActiveState' | 'active' | 'inactive', 'followsWindowActiveState'>;
}

export type BlendingMode = 'behindWindow' | 'withinWindow';

export type State = 'followsWindowActiveState' | 'active' | 'inactive';

export interface VibrancyViewProps extends IViewProps {
  material?: Material;
  blendingMode?: BlendingMode;
  state?: State;
}
