import * as React from 'react';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { PressableUsage } from './PressableUsage';
import { TextLegacyE2ETest } from './TextLegacyE2ETest';
import { Test, TestSection, PlatformStatus } from '../Test';
import { TEXT_TESTPAGE } from '../../../../E2E/src/index.consts';

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

  return <Test name="Text Test" description={description} spec={spec} sections={textSections} status={status} />;
};
