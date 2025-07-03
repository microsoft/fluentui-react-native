import * as React from 'react';

import { SHADOW_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import { ShadowButtonTestSection } from './ShadowButtonTestSection';
import { ShadowDepthTestSection } from './ShadowDepthTestSection';
import { ShadowWithDifferentPropsTestSection } from './ShadowWithDifferentPropsTestSection';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const shadowSections: TestSection[] = [
  {
    name: 'Shadow Depth Ramp',
    testID: SHADOW_TESTPAGE,
    component: ShadowDepthTestSection,
  },
  {
    name: 'Shadows on Button Examples',
    component: ShadowButtonTestSection,
  },
  {
    name: 'Shadows with Different Props Test',
    component: ShadowWithDifferentPropsTestSection,
  },
];

export const ShadowTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Production',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description = 'A Shadow component using the Fluent Design System. Shadow components can be added to other components.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/experimental/Shadow/SPEC.md';

  return <Test name="Shadow Test" description={description} spec={spec} sections={shadowSections} status={status} />;
};
