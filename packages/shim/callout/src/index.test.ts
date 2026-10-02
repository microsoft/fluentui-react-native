import { Callout, calloutName } from './index';
import { Callout as NativeCallout, calloutName as nativeCalloutName } from '@fluentui-react-native/native-core';
import type { CalloutHandle, CalloutProps, ICalloutProps, ICalloutTokens } from './index';
import type { CalloutHandle as NativeCalloutHandle, CalloutProps as NativeCalloutProps } from '@fluentui-react-native/native-core';

const props: ICalloutProps & ICalloutTokens = { directionalHint: 'bottomCenter' };
const nativeProps: NativeCalloutProps = props;
const legacyProps: CalloutProps = nativeProps;
const handle: NativeCalloutHandle = { blurWindow() {}, focusWindow() {} };
const legacyHandle: CalloutHandle = handle;

describe('Callout compatibility shim', () => {
  it('re-exports the exact native-core component and name', () => {
    expect(Callout).toBe(NativeCallout);
    expect(calloutName).toBe(nativeCalloutName);
  });

  it('preserves public and deprecated type contracts', () => {
    expect(legacyProps).toBe(props);
    expect(legacyHandle).toBe(handle);
  });
});
