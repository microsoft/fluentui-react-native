import * as React from 'react';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { PressableUsage } from './PressableUsage';
import { E2ETextTest } from './TextE2ETest';
import { V2Usage } from './V2Usage';
import { Test, TestSection, PlatformStatus } from '../Test';

const textSections: TestSection[] = [
  {
    name: 'Standard Usage',
    component: StandardUsage,
  },
  {
    name: 'V2 Usage',
    component: V2Usage,
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
    component: E2ETextTest,
  },
];

export const TextTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Beta',
  };

  const description = 'Text is a component for displaying text. You can use Text to standardize text across your app.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/text/SPEC.md';

  return <Test name="Text Test" description={description} spec={spec} sections={textSections} status={status} />;
};
