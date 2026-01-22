import * as React from 'react';
import { Alert } from 'react-native';

import { Link } from '@fluentui/react-native';
import { LINK_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';

import { E2ELinkLegacyTest } from './E2ELinkLegacyTest';
import { stackStyle } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const Links: React.FunctionComponent = () => {
  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };

  return (
    <Stack style={stackStyle}>
      <Link url="https://www.bing.com/" content="Click to navigate." />
      <Link onPress={doPress} content="Click to alert." />
    </Stack>
  );
};

const linkSections: TestSection[] = [
  {
    name: 'Navigation and Alert',
    testID: LINK_TESTPAGE,
    component: Links,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'Link E2E Test',
    component: E2ELinkLegacyTest,
  },
];

export const LinkLegacyTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Deprecated',
    uwpStatus: 'Deprecated',
    iosStatus: 'Deprecated',
    macosStatus: 'Deprecated',
    androidStatus: 'Deprecated',
  };

  const description =
    'With a Link, users can navigate to another page, window, or Help topic; display a definition; initiate a command; or choose an option. A Link indicates that it can be clicked, typically by being displayed using the visited or unvisited link system colors. Traditionally, Links are underlined as well, but that approach is often unnecessary and falling out of favor to reduce visual clutter.\n\nA Link is the lightest weight clickable control, and is often used to reduce the visual complexity of a design.';

  return <Test name="Link Legacy Test" description={description} sections={linkSections} status={status} e2eSections={e2eSections}></Test>;
};
