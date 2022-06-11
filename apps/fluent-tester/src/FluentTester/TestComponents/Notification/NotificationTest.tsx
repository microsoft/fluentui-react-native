import * as React from 'react';
// import { Notification } from
import { View, Text } from 'react-native';
import { Test, TestSection, PlatformStatus } from '../Test';
// import { ColorValue } from 'react-native';


const PrimaryToastTest: React.FunctionComponent = () => {

  const styles = {
    container: {
      width: null,
      backgroundColor: 'skyblue',
      borderRadius: 12,

      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

      padding: 16,
    },
    left: {
      fontSize: 16,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    right: {
      fontSize: 16,
      fontWeight: '500',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  }

  return (
    <View style={styles.container as any}>
      <Text style={styles.left as any}>Mail Archived</Text>
      <Text style={styles.right as any}>Undo</Text>
    </View>
  );
};

const NeutralToastTest: React.FunctionComponent = () => {

  const styles = {
    container: {
      width: null,
      backgroundColor: 'lightgrey',
      borderRadius: 12,

      flexDirection: 'row',
      alignItems: 'center',

      padding: 16,
    },
    left: {
      fontSize: 16,
      width: 0,
      flexGrow: 1,
      flex: 1,
    },
    right: {
      fontSize: 16,
      fontWeight: '500',
      
      marginLeft: 34,
    },
  }

  return (
    <View style={styles.container as any}>
      <Text style={styles.left as any}>Some items require you to sign in to view them</Text>
      <Text style={styles.right as any}>Sign in</Text>
    </View>
  );
};

const DangerToastTest: React.FunctionComponent = () => {

  const styles = {
    container: {
      width: null,
      backgroundColor: 'pink',
      borderRadius: 12,

      flexDirection: 'row',
      alignItems: 'center',

      padding: 16,
    },
    left: {
      color: 'maroon',
      fontSize: 16,
      width: 0,
      flexGrow: 1,
      flex: 1,
    },
    right: {
      color: 'maroon',
      fontSize: 16,
      fontWeight: '500',
      
      marginLeft: 34,
    },
  }

  return (
    <View style={styles.container as any}>
      <Text style={styles.left as any}>There was a problem, and your recent changes may not have saved</Text>
      <Text style={styles.right as any}>Retry</Text>
    </View>
  );
};

const WarningToastTest: React.FunctionComponent = () => {

  const styles = {
    container: {
      width: null,
      backgroundColor: 'lightyellow',
      borderRadius: 12,

      flexDirection: 'row',
      alignItems: 'center',

      padding: 16,
    },
    left: {
      color: 'brown',
      fontSize: 16,
      width: 0,
      flexGrow: 1,
      flex: 1,
    },
    right: {
      color: 'brown',
      fontSize: 16,
      fontWeight: '500',
      
      marginLeft: 34,
    },
  }

  return (
    <View style={styles.container as any}>
      <Text style={styles.left as any}>Read Only</Text>
      <Text style={styles.right as any}>X</Text>
    </View>
  );
};

const notificationSections: TestSection[] = [
  {
    name: 'Primary Toast',
    component: PrimaryToastTest,
  },
  {
    name: 'Neutral Toast',
    component: NeutralToastTest,
  },
  {
    name: 'Danger Toast',
    component: DangerToastTest,
  },
  {
    name: 'Warning Toast',
    component: WarningToastTest,
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

  return <Test name="Notification Test" description={description} sections={notificationSections} status={status}></Test>;
};
