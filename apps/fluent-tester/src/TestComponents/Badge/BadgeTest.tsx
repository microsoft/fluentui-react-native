import * as React from 'react';
import { BADGE_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { BasicBadge } from './BasicBadgeTest';
import { CounterBadgeTest } from './CounterBadgeTest';
import { PresenceBadgeTest } from './PresenceBadgeTest';

const badgeSections: TestSection[] = [
  {
    name: 'Basic Badge',
    testID: BADGE_TESTPAGE,
    component: BasicBadge,
  },
  {
    name: 'Counter Badge',
    component: CounterBadgeTest,
  },
  {
    name: 'Presence Badge',
    component: PresenceBadgeTest,
  },
];

export const BadgeTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description =
    'A badge is an additional visual descriptor for UI elements. It can be used to denote numerical value, status or general information.\n Included in this spec are base properties for usage in all badge scenarios. Reference properties for other badge types i.e. size, layout, and style variations';

  return <Test name="Badge Test" description={description} sections={badgeSections} status={status}></Test>;
};
