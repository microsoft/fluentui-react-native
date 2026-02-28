import type { ViewProps } from 'react-native';
import type { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import { requireNativeComponent } from 'react-native';

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

export default requireNativeComponent<NativeProps>('FRNVibrancyView');
