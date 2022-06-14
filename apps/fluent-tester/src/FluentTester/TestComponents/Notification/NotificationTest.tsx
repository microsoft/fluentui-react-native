import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Test, TestSection, PlatformStatus } from '../Test';

const NotificationVariants = ['primary', 'neutral', 'danger', 'warning'] as const;

const Notification = (props) => {
  const variant = props.variant;
  const startText = props.startText;
  const endText = props.endText;

  let containerBackgroundColor = 'skyblue';
  let foregroundColor = 'black';
  
  switch(variant) {
    case 'primary':
      containerBackgroundColor = 'skyblue';
      break;
    case 'neutral':
      containerBackgroundColor = 'lightgrey';
      break;
    case 'danger':
      containerBackgroundColor = 'pink';
      foregroundColor = 'maroon';
      break;
    case 'warning':
      containerBackgroundColor = 'lightyellow';
      foregroundColor = 'brown';
      break;
  };

  let styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      backgroundColor: containerBackgroundColor,
  
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    start: {
      fontSize: 16,
      color: foregroundColor,

      flex: 1,
      flexGrow: 1,
    },
    end: {
      fontSize: 16,
      fontWeight: '500',
      color: foregroundColor,

      marginLeft: 34,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.start}>{startText}</Text>
      <Text style={styles.end}>{endText}</Text>
    </View>
  );
};

const PrimaryTest: React.FunctionComponent = () => {
  return (
    <Notification variant={NotificationVariants[0]}
                  startText = 'Mail Archived' endText = 'Undo'/>
  );
};

const NeutralTest: React.FunctionComponent = () => {
  return (
    <Notification variant={NotificationVariants[1]}
                  startText = 'Some items require you to sign in to view them'
                  endText = 'Sign in'/>
  );
};

const DangerTest: React.FunctionComponent = () => {
  return (
    <Notification variant={NotificationVariants[2]}
                  startText = 'There was a problem, and your recent changes may not have saved'
                  endText = 'Retry'/>
  );
};

const WarningTest: React.FunctionComponent = () => {
  return (
    <Notification variant={NotificationVariants[3]} 
                  startText = 'Read Only' endText = 'X'/>
  );
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
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'Testing notification component';

  return <Test name="Notification Test" description={description} 
               sections={notificationSections} status={status}></Test>;
};
