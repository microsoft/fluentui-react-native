import * as React from 'react';

import { TooltipDefault } from './TooltipDefault';
import { TooltipPosition } from './TooltipPosition';
import { TOOLTIP_TESTPAGE } from '../../../../E2E/src/Tooltip/consts';
import { Test } from '../Test';
import type { TestSection, PlatformStatus } from '../Test';

const tooltipSections: TestSection[] = [
  {
    name: 'Default',
    testID: TOOLTIP_TESTPAGE,
    component: TooltipDefault,
  },
  {
    name: 'Target + Positioning',
    component: TooltipPosition,
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

  return <Test name="Tooltip Test" description={description} sections={tooltipSections} status={status} />;
};
