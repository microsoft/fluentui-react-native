import * as React from 'react';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { Test, TestSection, PlatformStatus } from '../Test';

const textSections: TestSection[] = [
  {
    name: 'Standard Usage',
    component: StandardUsage
  },
  {
    name: 'Customize Usage',
    component: CustomizeUsage
  }
];

export const TextTest: React.FunctionComponent<{}> = () => {

  const status: PlatformStatus = {
    win32Status: 'experimental',
    uwpStatus: 'experimental',
    iosStatus: 'experimental',
    macosStatus: 'experimental',
    androidStatus: 'beta'
  }

  const description = 'Text is a component for displaying text. You can use Text to standardize text across your app.'

  return (
    <Test name="Text Test" description={description} sections={textSections} status={status}></Test>
  );
};
