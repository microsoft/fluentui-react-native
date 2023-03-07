import * as React from 'react';

import { CustomizeUsage } from './CustomizeUsage';
import { PressableUsage } from './PressableUsage';
import { StandardUsage } from './StandardUsage';
import { TextLegacyE2ETest } from './TextLegacyE2ETest';
import { TEXT_TESTPAGE } from '../../../../E2E/src/index.consts';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const textSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: TEXT_TESTPAGE,
    component: StandardUsage,
  },
  {
    name: 'Customize Usage',
    component: CustomizeUsage,
  },
  {
    name: 'Pressable Usage',
    component: PressableUsage,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'E2E Text Tests',
    component: TextLegacyE2ETest,
  },
];

export const TextLegacyTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Deprecated',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Beta',
  };

  const description = 'Text is a component for displaying text. You can use Text to standardize text across your app.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/text/SPEC.md';

  return <Test name="Text Test" description={description} spec={spec} sections={textSections} status={status} e2eSections={e2eSections} />;
};
