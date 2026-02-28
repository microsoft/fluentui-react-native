import type { HostComponent, ViewProps } from 'react-native';
import type { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

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

export default codegenNativeComponent<NativeProps>('FRNVibrancyView') as HostComponent<NativeProps>;
