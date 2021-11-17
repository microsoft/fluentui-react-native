import * as React from 'react';
import { AVATAR_WIN32_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { StandardUsage } from './BasicAvatar';
import { CustomizeUsage } from './CustomizedAvatar';

const avatarSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: AVATAR_WIN32_TESTPAGE,
    component: StandardUsage,
  },
  {
    name: 'Customize Usage',
    component: CustomizeUsage,
  },
];

export const AvatarTestWin32: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description =
    'AvatarView is a visual representation of a user, entity, or group. If an image is supplied, it is cropped to a circle of the requested size. If an image is not supplied, initials are extracted from the given name and email address provided and displayed on a colorful background.';

  return <Test name="Avatar Test" description={description} sections={avatarSections} status={status} />;
};
