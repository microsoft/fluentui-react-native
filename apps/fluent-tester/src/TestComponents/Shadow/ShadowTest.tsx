import * as React from 'react';
import { Test, TestSection, PlatformStatus } from '../Test';
import { SHADOW_TESTPAGE } from './consts';
import { ShadowDepthTestSection } from './ShadowDepthTestSection';
import { ShadowButtonTestSection } from './ShadowButtonTestSection';
import { ShadowWithDifferentPropsTestSection } from './ShadowWithDifferentPropsTestSection';

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
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'A Shadow component using the Fluent Design System. Shadow components can be added to other components.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/experimental/Shadow/SPEC.md';

  return <Test name="Shadow Test" description={description} spec={spec} sections={shadowSections} status={status} />;
};
