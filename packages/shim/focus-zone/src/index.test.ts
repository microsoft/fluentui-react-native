import { FocusZone, focusZoneName } from './index';
import { FocusZone as NativeFocusZone, focusZoneName as nativeFocusZoneName } from '@fluentui-react-native/native-core/legacy';
import type { FocusZoneProps, FocusZoneRenderData, FocusZoneState, FocusZoneTokens, FocusZoneType, NativeProps } from './index';
import type { FocusZoneNativeProps, FocusZoneProps as NativeFocusZoneProps } from '@fluentui-react-native/native-core/legacy';

const props: FocusZoneProps = { focusZoneDirection: 'horizontal', isCircularNavigation: true };
const nativeProps: NativeFocusZoneProps = props;
const nativeRootProps: FocusZoneNativeProps = { navigateAtEnd: 'NavigateWrap' };
const legacyRootProps: NativeProps = nativeRootProps;
const state: FocusZoneState = {};
const tokens: FocusZoneTokens = {};
const renderData: FocusZoneRenderData = { slotProps: { root: legacyRootProps }, state };
const legacyType: FocusZoneType = { props, tokens, slotProps: renderData.slotProps, state };

describe('FocusZone compatibility shim', () => {
  it('re-exports the exact native-core component and name', () => {
    expect(FocusZone).toBe(NativeFocusZone);
    expect(focusZoneName).toBe(nativeFocusZoneName);
  });

  it('preserves public, native, and deprecated type contracts', () => {
    expect(nativeProps).toBe(props);
    expect(legacyRootProps).toBe(nativeRootProps);
    expect(legacyType.state).toBe(state);
  });
});
