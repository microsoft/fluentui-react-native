import * as React from 'react';
// import { Notification } from
import { View, Text } from 'react-native';
import { Test, TestSection, PlatformStatus } from '../Test';


const RectangleTest: React.FunctionComponent = () => {

  const styles = {
    rectangle: {
      height: 50,
      // width: 200,
      flex: 1,
      width: null,

      borderColor: 'grey',
      borderWidth: 2,
      borderRadius: 9,

      justifyContent: 'center',
      alignItems: 'center',
    },
  }

  return (
    <View style={styles.rectangle as any}>
      {/* <Text style={styles.words as any}>Notification!</Text> */}
      <Text> Notification!</Text>
    </View>
  );
};

const notificationSections: TestSection[] = [
  {
    name: 'Rectangle Test',
    component: RectangleTest,
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
