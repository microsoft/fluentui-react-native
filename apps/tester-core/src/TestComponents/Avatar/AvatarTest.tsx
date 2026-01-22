import * as React from 'react';
import { Platform } from 'react-native';

import { AVATAR_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import type { PlatformStatus, TestSection } from '../Test';
import { Test } from '../Test';
import { StandardUsage } from './BasicAvatar';
import { CustomizeUsage } from './CustomizedAvatar';
import { E2EAvatarTest } from './E2EAvatarTest';

const avatarSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: AVATAR_TESTPAGE,
    component: StandardUsage,
  },
  ...Platform.select({
    android: [null],
    default: [
      {
        name: 'Customize Usage',
        component: CustomizeUsage,
      },
    ],
  }),
];

const e2eSections: TestSection[] = [
  {
    name: 'Avatar E2E',
    component: E2EAvatarTest,
  },
];

export const AvatarTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description =
    'AvatarView is a visual representation of a user, entity, or group. If an image is supplied, it is cropped to a circle of the requested size. If an image is not supplied, initials are extracted from the given name and email address provided and displayed on a colorful background.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Avatar/SPEC.md';

  return (
    <Test name="Avatar Test" description={description} spec={spec} sections={avatarSections} status={status} e2eSections={e2eSections} />
  );
};
