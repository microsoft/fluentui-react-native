import * as React from 'react';
import { StandardUsage } from './StandardUsage';
import { V2Usage } from './V2Usage';
import { MaximumFontSizeUsage } from './MaximumFontSize';
import { CustomizeUsage } from './CustomizeUsage';
import { PressableUsage } from './PressableUsage';
import { Test, TestSection, PlatformStatus } from '../Test';
import { E2EExperimentalTextTest } from './TextV1E2ETest';
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
    name: 'E2E Testing for Experimental Text',
    component: E2EExperimentalTextTest,
  },
];

export const TextExperimentalTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Experimental',
  };

  const description = 'Text is a component for displaying text. You can use Text to standardize text across your app.';

  return <Test name="Experimental Text Test" description={description} sections={textSections} status={status} />;
};
