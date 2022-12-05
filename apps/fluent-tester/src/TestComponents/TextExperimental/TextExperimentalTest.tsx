import * as React from 'react';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { PressableUsage } from './PressableUsage';
import { Test, TestSection, PlatformStatus } from '../Test';
import { E2EExperimentalTextTest } from './ExperimentalTextE2ETest';
import { EXPERIMENTAL_TEXT_TESTPAGE } from './consts';
import { V2Usage } from './V2Usage';

const textSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: EXPERIMENTAL_TEXT_TESTPAGE,
    component: StandardUsage,
  },
  {
    name: 'V2/V1 Comparison',
    component: V2Usage,
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
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Beta',
  };

  const description = 'Text is a component for displaying text. You can use Text to standardize text across your app.';

  return <Test name="Experimental Text Test" description={description} sections={textSections} status={status} />;
};
