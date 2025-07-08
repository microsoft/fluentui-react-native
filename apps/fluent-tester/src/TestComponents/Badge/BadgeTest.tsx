import * as React from 'react';
import { Platform } from 'react-native';

import { BADGE_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import { BasicBadge } from './BasicBadgeTest';
import { CounterBadgeTest } from './CounterBadgeTest';
import { E2EBadgeTest } from './E2EBadgeTest';
import { PresenceBadgeTest } from './PresenceBadgeTest';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const badgeSections: TestSection[] = [
  Platform.select({
    android: null,
    default: {
      name: 'Basic Badge',
      testID: BADGE_TESTPAGE,
      component: BasicBadge,
    },
  }),
  {
    name: 'Counter Badge',
    testID: BADGE_TESTPAGE,
    component: CounterBadgeTest,
  },
  {
    name: 'Presence Badge',
    component: PresenceBadgeTest,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'Badge E2E',
    component: E2EBadgeTest,
  },
];

export const BadgeTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'N/A',
    macosStatus: 'Production',
    androidStatus: 'N/A',
  };

  const description =
    'A badge is an additional visual descriptor for UI elements. It can be used to denote numerical value, status or general information.\n Included in this spec are base properties for usage in all badge scenarios. Reference properties for other badge types i.e. size, layout, and style variations';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Badge/SPEC.md';

  return (
    <Test name="Badge Test" description={description} spec={spec} sections={badgeSections} status={status} e2eSections={e2eSections} />
  );
};
