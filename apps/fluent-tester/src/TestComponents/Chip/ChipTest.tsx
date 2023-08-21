import * as React from 'react';

import { ChipDefault } from './ChipDefault';
import { E2EChipTest } from './E2EChipTest';
import { CHIP_TESTPAGE } from '../../../../E2E/src/Chip/consts';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const chipSections: TestSection[] = [
  {
    name: 'Default Chip',
    testID: CHIP_TESTPAGE,
    component: ChipDefault,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'Chip E2E',
    component: E2EChipTest,
  },
];

export const ChipTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Experimental',
    macosStatus: 'Backlog',
    androidStatus: 'Experimental',
  };

  const description =
    'Chips are compact representations of entities (most commonly, people) that can be typed in, deleted or dragged easily.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Chip/SPEC.md';

  return <Test name="Chip Test" description={description} spec={spec} sections={chipSections} status={status} e2eSections={e2eSections} />;
};
