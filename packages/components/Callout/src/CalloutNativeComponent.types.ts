import type { HostComponent } from 'react-native';
import type { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import type { UnsafeMixed } from './codegenTypes';
import type { NativePropsBase } from './Callout.types';

export interface NativeProps extends NativePropsBase {
  directionalHint?: WithDefault<
    | 'leftTopEdge'
    | 'leftCenter'
    | 'leftBottomEdge'
    | 'topLeftEdge'
    | 'topAutoEdge'
    | 'topCenter'
    | 'topRightEdge'
    | 'rightTopEdge'
    | 'rightCenter'
    | 'rightBottomEdge'
    | 'bottonLeftEdge'
    | 'bottomAutoEdge'
    | 'bottomCenter'
    | 'bottomRightEdge',
    'bottonLeftEdge'
  >;
  target?: UnsafeMixed;
}

export type CalloutComponentType = HostComponent<NativeProps>;
export type CalloutNativeCommands = {
  focusWindow: (viewRef: React.ElementRef<CalloutComponentType>) => void;
  blurWindow: (viewRef: React.ElementRef<CalloutComponentType>) => void;
};
