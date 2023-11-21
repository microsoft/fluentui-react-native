import * as React from 'react';

import { TOOLTIP_TESTPAGE } from './consts';
import { TooltipDefault } from './TooltipDefault';
import { Test } from '../Test';
import type { TestSection, PlatformStatus } from '../Test';

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

  const description =
    'A Tooltip component displays additional information about another component. Tooltip is not expected to handle interactive content.';

  return <Test name="Tooltip Test" description={description} sections={tooltipSections} status={status}></Test>;
};
