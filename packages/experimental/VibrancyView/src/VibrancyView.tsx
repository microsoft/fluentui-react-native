/** @jsxRuntime classic */
import React from 'react';

import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

import type { VibrancyViewProps } from './VibrancyView.types';

const NativeVibrancyView = ensureNativeComponent('FRNVibrancyView');

export const VibrancyView = (props: VibrancyViewProps) => {
  return <NativeVibrancyView {...props} />;
};

export default VibrancyView;
