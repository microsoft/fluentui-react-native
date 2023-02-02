import * as React from 'react';
import { StandardUsage } from './StandardUsage';
import { V2Usage } from './V2Usage';
import { MaximumFontSizeUsage } from './MaximumFontSize';
import { CustomizeUsage } from './CustomizeUsage';
import { PressableUsage } from './PressableUsage';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';
import { TextV1E2ETest } from './TextV1E2ETest';
import { TEXTV1_TESTPAGE } from '../../../../E2E/src/TextV1/consts';

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
  {
    name: 'E2E Testing for TextV1',
    component: TextV1E2ETest,
  },
];

export const TextV1Test: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Experimental',
  };

  const description = 'Text is a component for displaying text. You can use Text to standardize text across your app.';

  return <Test name="TextV1 Test" description={description} sections={textSections} status={status} />;
};
