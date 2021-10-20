import * as React from 'react';
import { LayoutPlayArea } from './LayoutTestSection';
import { LayoutTestPageId } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const buttonSections: TestSection[] = [
  {
    name: 'Layout',
    testID: LayoutTestPageId,
    component: LayoutPlayArea,
  },
];

export const LayoutTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'Layout test page.';

  return <Test name="Layout Test" description={description} sections={buttonSections} status={status} />;
};
