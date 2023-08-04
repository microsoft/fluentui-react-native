/** @jsxRuntime classic */
import React from 'react';

import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const NativeVisualEffectView = ensureNativeComponent('FRNVisualEffectView');

export const VisualEffectView = (props) => {
  return <NativeVisualEffectView {...props} />;
};

export default VisualEffectView;
