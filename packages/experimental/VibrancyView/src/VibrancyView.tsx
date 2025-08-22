/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { VibrancyViewProps } from './VibrancyView.types';
import NativeVibrancyView from './VibrancyViewNativeComponent';

export const VibrancyView = (props: VibrancyViewProps) => {
  return <NativeVibrancyView {...props} />;
};

export default VibrancyView;
