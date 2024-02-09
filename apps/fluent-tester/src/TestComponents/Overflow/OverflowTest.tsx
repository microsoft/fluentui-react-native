import * as React from 'react';

import { Overflow, OverflowItem } from '@fluentui-react-native/overflow';

import { Test } from '../Test';

export function OverflowMainTest() {
  return (
    <Overflow>
      <OverflowItem id="a">Item A</OverflowItem>
      <OverflowItem id="b">Item B</OverflowItem>
      <OverflowItem id="c">Item C</OverflowItem>
    </Overflow>
  );
}

export const OverflowTest: React.FunctionComponent = () => {
  const description = 'A Divider is a visual separator that can contain content (text or an icon). Dividers can be horizontal or vertical';
  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Divider/SPEC.md';

  return (
    <Test
      name="Divider Test"
      description={description}
      sections={[
        {
          name: 'Overflow',
          component: OverflowMainTest,
        },
      ]}
      spec={spec}
      status={{
        win32Status: 'Production',
        uwpStatus: 'Backlog',
        iosStatus: 'Production',
        macosStatus: 'Production',
        androidStatus: 'Production',
      }}
    />
  );
};
