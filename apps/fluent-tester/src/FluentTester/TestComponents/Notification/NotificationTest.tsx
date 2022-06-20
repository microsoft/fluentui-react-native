import * as React from 'react';
import { Notification } from '@fluentui-react-native/notification';
import { Test, TestSection, PlatformStatus } from '../Test';

const PrimaryTest: React.FunctionComponent = () => {
  return <Notification variant={'primary'} startText="Mail Archived" endText="Undo" />;
};

const NeutralTest: React.FunctionComponent = () => {
  return <Notification variant={'neutral'} startText="Some items require you to sign in to view them" endText="Sign in" />;
};

const DangerTest: React.FunctionComponent = () => {
  return <Notification variant={'danger'} startText="There was a problem, and your recent changes may not have saved" endText="Retry" />;
};

const WarningTest: React.FunctionComponent = () => {
  return <Notification variant={'warning'} startText="Read Only" endText="X" />;
};

const notificationSections: TestSection[] = [
  {
    name: 'Primary',
    component: PrimaryTest,
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
