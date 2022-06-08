import * as React from 'react';
import { SHADOW_TESTPAGE } from './consts';
import { ShadowDefault } from './ShadowDefault';
import { Test, TestSection, PlatformStatus } from '../Test';

const shadowSections: TestSection[] = [
  {
    name: 'Shadow Page',
    testID: SHADOW_TESTPAGE,
    component: ShadowDefault,
  },
];

export const ShadowTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description = 'component-description';

  return <Test name="Shadow Test" description={description} sections={shadowSections} status={status}></Test>;
};
