import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { NativeProps, CalloutComponentType, CalloutNativeCommands } from './CalloutNativeComponent.types';

export const Commands: CalloutNativeCommands = codegenNativeCommands<CalloutNativeCommands>({
  supportedCommands: ['blurWindow', 'focusWindow'],
});

export default codegenNativeComponent<NativeProps>('RCTCallout') as CalloutComponentType;
