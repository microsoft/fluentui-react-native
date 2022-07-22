import * as React from 'react';
import { Notification } from '@fluentui-react-native/notification';
import { Test, TestSection, PlatformStatus } from '../Test';
import { SvgIconProps } from '@fluentui-react-native/icon';
import PlayButton from './assets/play_button.svg';

const svgProps: SvgIconProps = {
  src: PlayButton,
};
const iconProps = { svgSource: svgProps };

const PrimaryTest: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'primary'}
      action="Undo"
      onPress={() => {
        console.log('Notification tapped');
      }}
      onActionPress={() => {
        console.log('Undo tapped');
      }}
    >
      Mail Archived
    </Notification>
  );
};

const PrimaryTestWithTitleAndIcon: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'primary'}
      icon={iconProps}
      title="Kat's iPhoneX"
      onPress={() => {
        console.log('Notification tapped');
      }}
    >
      Listen to Emails • 7 mins
    </Notification>
  );
};

const NeutralTest: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'neutral'}
      action="Sign in"
      onPress={() => {
        console.log('Notification tapped');
      }}
      onActionPress={() => {
        console.log('Sign in tapped');
      }}
    >
      Some items require you to sign in to view them
    </Notification>
  );
};

const DangerTest: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'danger'}
      action="Retry"
      onPress={() => {
        console.log('Notification tapped');
      }}
      onActionPress={() => {
        console.log('Retry tapped');
      }}
    >
      There was a problem, and your recent changes may not have saved
    </Notification>
  );
};

const WarningTest: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'warning'}
      onPress={() => {
        console.log('Notification tapped');
      }}
    >
      Read Only
    </Notification>
  );
};

const PrimaryBarTest: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'primaryBar'}
      onPress={() => {
        console.log('Notification tapped');
      }}
    >
      Updating...
    </Notification>
  );
};

const PrimaryOutlineBarTest: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'primaryOutlineBar'}
      onPress={() => {
        console.log('Notification tapped');
      }}
    >
      Mail Sent
    </Notification>
  );
};

const NeutralBarTest: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'neutralBar'}
      onPress={() => {
        console.log('Notification tapped');
      }}
    >
      No internet connection
    </Notification>
  );
};

const notificationSections: TestSection[] = [
  {
    name: 'Primary',
    component: PrimaryTest,
  },
  {
    name: 'Primary with Title and Icon',
    component: PrimaryTestWithTitleAndIcon,
  },
  {
    name: 'Neutral',
    component: NeutralTest,
  },
  {
    name: 'Danger',
    component: DangerTest,
  },
  {
    name: 'Warning',
    component: WarningTest,
  },
  {
    name: 'Primary Bar',
    component: PrimaryBarTest,
  },
  {
    name: 'Primary Outline Bar',
    component: PrimaryOutlineBarTest,
  },
  {
    name: 'Neutral Bar',
    component: NeutralBarTest,
  },
];

export const NotificationTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Experimental',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'Testing notification component';

  return <Test name="Notification Test" description={description} sections={notificationSections} status={status}></Test>;
};
