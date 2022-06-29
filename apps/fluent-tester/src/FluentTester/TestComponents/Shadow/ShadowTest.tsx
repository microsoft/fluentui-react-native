import * as React from 'react';
import { Text } from '@fluentui/react-native';
import { Test, TestSection, PlatformStatus } from '../Test';
import { SHADOW_TESTPAGE } from './consts';
import { ShadowDepthTestSection } from './ShadowDepthTestSection';

const ShadowButtonTest: React.FunctionComponent = () => {
  return <Text>TODO</Text>;
};

const shadowSections: TestSection[] = [
  {
    name: 'Shadow Depth Ramp',
    testID: SHADOW_TESTPAGE,
    component: ShadowDepthTestSection,
  },
  {
    name: 'Shadows on Button Examples',
    testID: SHADOW_TESTPAGE,
    component: ShadowButtonTest,
  },
];

export const ShadowTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Experimental',
  };

  const description = 'A Shadow component using the Fluent Design System. Shadow components can be added to other components.';

  return <Test name="Shadow Test" description={description} sections={shadowSections} status={status} />;
};
