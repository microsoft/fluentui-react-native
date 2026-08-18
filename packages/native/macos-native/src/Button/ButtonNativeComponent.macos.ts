import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  title?: string;
  bezelStyle?: WithDefault<
    | 'rounded'
    | 'regularSquare'
    | 'texturedRounded'
    | 'texturedSquare'
    | 'shadowlessSquare'
    | 'circular'
    | 'help'
    | 'smallSquare'
    | 'roundRect'
    | 'recessed'
    | 'roundedDisclosure'
    | 'inline'
    | 'glass',
    'rounded'
  >;
  disabled?: boolean;
  tooltip?: string;
  onPress?: BubblingEventHandler<null>;
}

export default codegenNativeComponent<NativeProps>('FRNButton') as HostComponent<NativeProps>;
