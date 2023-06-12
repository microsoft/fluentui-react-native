import * as React from 'react';
import { TOOLTIP_TESTPAGE } from './consts';
import { TooltipDefault } from './TooltipDefault';
import { Test, TestSection, PlatformStatus } from '../Test';

const tooltipSections: TestSection[] = [
  {
    name: 'Tooltip',
    testID: TOOLTIP_TESTPAGE,
    component: TooltipDefault,
  },
];

export const TooltipTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'component-description';

  return <Test name="Tooltip Test" description={description} sections={tooltipSections} status={status}></Test>;
};
