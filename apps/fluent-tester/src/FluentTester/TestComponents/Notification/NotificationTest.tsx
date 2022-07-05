import * as React from 'react';
import { Notification } from '@fluentui-react-native/notification';
import { Test, TestSection, PlatformStatus } from '../Test';

const PrimaryTest: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'primary'}
      action="Undo"
      onPress={() => {
        console.log('Notification tapped');
      }}
    >
      Mail Archived
    </Notification>
  );
};

const PrimaryTestWithTitle: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'primary'}
      title="Kat's iPhone X"
      action="X"
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
    >
      There was a problem, and your recent changes may not have saved
    </Notification>
  );
};

const WarningTest: React.FunctionComponent = () => {
  return (
    <Notification
      variant={'warning'}
      action="X"
      onPress={() => {
        console.log('Notification tapped');
      }}
    >
      Read Only
    </Notification>
  );
};

const notificationSections: TestSection[] = [
  {
    name: 'Primary',
    component: PrimaryTest,
  },
  {
    name: 'Primary With Title',
    component: PrimaryTestWithTitle,
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
