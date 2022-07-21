import * as React from 'react';
import { Notification } from '@fluentui-react-native/notification';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Button, View } from 'react-native';
import { SvgIconProps } from '@fluentui-react-native/icon';
import PlayButton from './assets/play_button.svg';

const svgProps: SvgIconProps = {
  src: PlayButton,
};
const iconProps = { svgSource: svgProps };

const PrimaryTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  return (
    <View>
      <View style={{ marginBottom: 100 }}>
        <Button onPress={onButtonPress} title={visible ? 'Hide' : 'Show'} />
      </View>
      <Notification
        variant={'primary'}
        visible={visible}
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
    </View>
  );
};

const PrimaryTestWithTitleAndIcon: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  return (
    <View>
      <View style={{ marginBottom: 100 }}>
        <Button onPress={onButtonPress} title={visible ? 'Hide' : 'Show'} />
      </View>
      <Notification
        variant={'primary'}
        visible={visible}
        icon={iconProps}
        title="Kat's iPhoneX"
        onPress={() => {
          console.log('Notification tapped');
        }}
      >
        Listen to Emails • 7 mins
      </Notification>
    </View>
  );
};

const NeutralTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  return (
    <View>
      <View style={{ marginBottom: 100 }}>
        <Button onPress={onButtonPress} title={visible ? 'Hide' : 'Show'} />
      </View>
      <Notification
        variant={'neutral'}
        visible={visible}
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
    </View>
  );
};

const DangerTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  return (
    <View>
      <View style={{ marginBottom: 100 }}>
        <Button onPress={onButtonPress} title={visible ? 'Hide' : 'Show'} />
      </View>
      <Notification
        variant={'danger'}
        visible={visible}
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
    </View>
  );
};

const WarningTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  return (
    <View>
      <View style={{ marginBottom: 100 }}>
        <Button onPress={onButtonPress} title={visible ? 'Hide' : 'Show'} />
      </View>
      <Notification
        variant={'warning'}
        visible={visible}
        onPress={() => {
          console.log('Notification tapped');
        }}
      >
        Read Only
      </Notification>
    </View>
  );
};

const PrimaryBarTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  return (
    <View>
      <View style={{ marginBottom: 100 }}>
        <Button onPress={onButtonPress} title={visible ? 'Hide' : 'Show'} />
      </View>
      <Notification
        variant={'primaryBar'}
        visible={visible}
        onPress={() => {
          console.log('Notification tapped');
        }}
      >
        Updating...
      </Notification>
    </View>
  );
};

const PrimaryOutlineBarTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  return (
    <View>
      <View style={{ marginBottom: 100 }}>
        <Button onPress={onButtonPress} title={visible ? 'Hide' : 'Show'} />
      </View>
      <Notification
        variant={'primaryOutlineBar'}
        visible={visible}
        onPress={() => {
          console.log('Notification tapped');
        }}
      >
        Mail Sent
      </Notification>
    </View>
  );
};

const NeutralBarTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  return (
    <View>
      <View style={{ marginBottom: 100 }}>
        <Button onPress={onButtonPress} title={visible ? 'Hide' : 'Show'} />
      </View>
      <Notification
        variant={'neutralBar'}
        visible={visible}
        onPress={() => {
          console.log('Notification tapped');
        }}
      >
        No internet connection
      </Notification>
    </View>
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
