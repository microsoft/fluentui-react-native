import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import { requireNativeComponent } from 'react-native';

import type { NativeProps, CalloutComponentType, CalloutNativeCommands } from './CalloutNativeComponent.types.macos';

export const Commands: CalloutNativeCommands = codegenNativeCommands<CalloutNativeCommands>({
  supportedCommands: ['blurWindow', 'focusWindow'],
});

// no fabric for Win32, just use requireNativeComponent
export default requireNativeComponent<NativeProps>('RCTCallout') as CalloutComponentType;
