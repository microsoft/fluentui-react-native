import * as React from 'react';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { PressableUsage } from './PressableUsage';
import { Test, TestSection, PlatformStatus } from '../Test';

const textSections: TestSection[] = [
  {
    name: 'Standard Usage',
    component: StandardUsage,
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

export const TextTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Beta',
  };

  const description = 'Text is a component for displaying text. You can use Text to standardize text across your app.';

  return <Test name="Text Test" description={description} sections={textSections} status={status} />;
};
