import * as React from 'react';
import { Avatar } from '@fluentui-react-native/experimental-avatar';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { AVATAR_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const avatar: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <Avatar primaryText="John Smith" />
      <Avatar primaryText="John Smith" avatarStyle="square" />
      <Avatar primaryText="John Smith" presence="available" />
      <Avatar primaryText="John Smith" secondaryText="johnsmith@microsoft.com" presence="outOfOffice" />
      <Avatar secondaryText="johnsmith@microsoft.com" presence="outOfOffice" />
    </Stack>
  );
};

const stylizedAvatar: React.FunctionComponent<{}> = () => {
  const CustomizedAvatar = Avatar.customize({
    size: 'large',
  });

  return (
    <Stack style={stackStyle}>
      <CustomizedAvatar primaryText="John Smith" />
      <CustomizedAvatar primaryText="John Smith" avatarStyle="square" />
      <CustomizedAvatar primaryText="John Smith" presence="available" />
      <CustomizedAvatar primaryText="John Smith" secondaryText="johnsmith@microsoft.com" presence="outOfOffice" />
      <CustomizedAvatar secondaryText="johnsmith@microsoft.com" presence="outOfOffice" />
    </Stack>
  );
};

const avatarSections: TestSection[] = [
  {
    name: 'Basic Avatar',
    testID: AVATAR_TESTPAGE,
    component: avatar,
  },
  {
    name: 'Stylized Avatar',
    component: stylizedAvatar,
  },
];

export const AvatarTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'AvatarView is a visual representation of a user, entity, or group. If an image is supplied, it is cropped to a circle of the requested size. If an image is not supplied, initials are extracted from the given name and email address provided and displayed on a colorful background.';

  return <Test name="Avatar Test" description={description} sections={avatarSections} status={status}></Test>;
};
