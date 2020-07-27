import * as React from 'react';
import { Alert } from 'react-native';
import { Link } from '@fluentui-react-native/link';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { LINK_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const links: React.FunctionComponent<{}> = () => {

  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };

  return (
    <Stack style={stackStyle}>
      <Link url="https://www.bing.com/" content="Click to navigate." />
      <Link onPress={doPress} content="Click to alert." />
    </Stack>
  );
}

const linkSections: TestSection[] = [
  {
    name: 'Navigation and Alert',
    testID: LINK_TESTPAGE,
    component: links
  }
];

export const LinkTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    winStatus: 'beta',
    iosStatus: 'experimental',
    macosStatus: 'experimental',
    androidStatus: 'experimental'
  }

  return (
    <Test name="Link Test" description="No description." sections={linkSections} status={status}></Test>
  );
};