import type { HostComponent } from 'react-native';
import type { WithDefault, Int32 } from 'react-native/Libraries/Types/CodegenTypes';
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
    'topLeftEdge'
  >;
  target?: Int32;
}

// making these explicit as codegen can't always handle complex typescript types and fails silently
export type CalloutComponentType = HostComponent<NativeProps>;
export type CalloutNativeCommands = {
  focusWindow: (viewRef: React.ElementRef<CalloutComponentType>) => void;
  blurWindow: (viewRef: React.ElementRef<CalloutComponentType>) => void;
};
