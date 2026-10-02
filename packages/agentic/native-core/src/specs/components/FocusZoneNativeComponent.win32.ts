import { requireNativeComponent } from 'react-native';
import type { HostComponent, ViewProps } from 'react-native';
import type { UnsafeMixed, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeProps extends ViewProps {
  navigateAtEnd?: WithDefault<'NavigateStopAtEnds' | 'NavigateWrap' | 'NavigateContinue', 'NavigateStopAtEnds'>;
  defaultTabbableElement?: UnsafeMixed;
  focusZoneDirection?: WithDefault<'bidirectional' | 'vertical' | 'horizontal' | 'none', 'bidirectional'>;
  use2DNavigation?: boolean;
  tabKeyNavigation?: WithDefault<'None' | 'NavigateWrap' | 'NavigateStopAtEnds' | 'Normal', 'None'>;
  disabled?: boolean;
  isTabNavigation?: boolean;
  navigationOrderInRenderOrder?: boolean;
}

export type FocusZoneComponentType = HostComponent<NativeProps>;

export default requireNativeComponent<NativeProps>('RCTFocusZone') as FocusZoneComponentType;
