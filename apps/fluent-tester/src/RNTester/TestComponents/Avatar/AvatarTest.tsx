import * as React from 'react';
import { Avatar } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { AVATAR_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const avatar: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <Avatar avatarData={{ primaryText: 'John Smith' }} />
      <Avatar avatarData={{ primaryText: 'John Smith' }} avatarStyle="square" />
      <Avatar avatarData={{ primaryText: 'John Smith', presence: 'available' }} />
      <Avatar avatarData={{ primaryText: 'John Smith', secondaryText: 'johnsmith@microsoft.com', presence: 'outOfOffice' }} />
      <Avatar avatarData={{ secondaryText: 'johnsmith@microsoft.com', presence: 'outOfOffice' }} />
    </Stack>
  );
};

const stylizedAvatar: React.FunctionComponent<{}> = () => {
  const CustomizedAvatar = Avatar.customize({
    size: 'large',
  });

  return (
    <Stack style={stackStyle}>
      <CustomizedAvatar avatarData={{ primaryText: 'John Smith' }} />
      <CustomizedAvatar avatarData={{ primaryText: 'John Smith' }} avatarStyle="square" />
      <CustomizedAvatar avatarData={{ primaryText: 'John Smith', presence: 'available' }} />
      <CustomizedAvatar avatarData={{ primaryText: 'John Smith', secondaryText: 'johnsmith@microsoft.com', presence: 'outOfOffice' }} />
      <CustomizedAvatar avatarData={{ secondaryText: 'johnsmith@microsoft.com', presence: 'outOfOffice' }} />
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
