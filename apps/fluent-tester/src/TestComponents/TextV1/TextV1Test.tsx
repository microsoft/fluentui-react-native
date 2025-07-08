import * as React from 'react';

import { TEXTV1_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import { CustomizeUsage } from './CustomizeUsage';
import { MaximumFontSizeUsage } from './MaximumFontSize';
import { PressableUsage } from './PressableUsage';
import { StandardUsage } from './StandardUsage';
import { TextV1E2ETest } from './TextV1E2ETest';
import { V2Usage } from './V2Usage';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const textSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: TEXTV1_TESTPAGE,
    component: StandardUsage,
  },
  {
    name: 'V1/V2 Comparison',
    component: V2Usage,
  },
  {
    name: 'Maximum Font Size Usage',
    component: MaximumFontSizeUsage,
  },
  {
    name: 'Customize Usage',
    component: CustomizeUsage,
  },
  {
    name: 'Pressable Usage',
    component: PressableUsage,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'E2E Testing for TextV1',
    component: TextV1E2ETest,
  },
];

export const TextV1Test: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Beta',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description = 'Text is a component for displaying text. You can use Text to standardize text across your app.';

  return <Test name="TextV1 Test" description={description} sections={textSections} status={status} e2eSections={e2eSections} />;
};
