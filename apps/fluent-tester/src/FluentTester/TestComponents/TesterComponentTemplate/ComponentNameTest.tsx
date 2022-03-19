import * as React from 'react';
import { COMPONENT_NAME_TESTPAGE } from './consts';
import { ComponentNameDefault } from './ComponentNameDefault';
import { Test, TestSection, PlatformStatus } from '../Test';

const componentNameSections: TestSection[] = [
  {
    name: 'ComponentName Page',
    testID: COMPONENT_NAME_TESTPAGE,
    component: ComponentNameDefault,
  },
];

export const ButtonTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description = 'component-description';

  return <Test name="ComponentName Test" description={description} sections={componentNameSections} status={status}></Test>;
};
