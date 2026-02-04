import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import { requireNativeComponent } from 'react-native';

import type { NativeProps, CalloutComponentType, CalloutNativeCommands } from './CalloutNativeComponent.types.macos';

export const Commands: CalloutNativeCommands = codegenNativeCommands<CalloutNativeCommands>({
  supportedCommands: ['blurWindow', 'focusWindow'],
});

// no fabric for macOS, just use requireNativeComponent
// macOS uses FRNCallout (registered by FRNCalloutManager), not RCTCallout
export default requireNativeComponent<NativeProps>('FRNCallout') as CalloutComponentType;
