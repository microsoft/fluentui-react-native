import * as React from 'react';
import { View, Text } from 'react-native';
import { Test, TestSection, PlatformStatus } from '../Test';

// const NotificationVariant string: 'primary' | 'neutral' | 'danger' | 'warning';
enum NotificationVariant { primary = 1, neutral, danger, warning };

const Notification = (props) => {
  const variant = props.variant;
  let leftText = ''; 
  let rightText = '';

  const styles: {[key: string]: any} = {
    container: {
      width: null,
      borderRadius: 12,

      flexDirection: 'row',
      padding: 16,
    },
    left: {
      fontSize: 16,
    },
    right: {
      fontSize: 16,
      fontWeight: '500',
    },
  };
  
  if (variant === 'primary') {
    styles.container['backgroundColor'] = 'skyblue';
    styles.container['justifyContent'] = 'space-between';
    
    leftText = 'Mail Archived';
    rightText = 'Undo';
  }
  else if (variant === 'neutral') {
    styles.container['backgroundColor'] = 'lightgrey';
    styles.container['alignItems'] = 'center';

    styles.left['width'] = 0;
    styles.left['flexGrow'] = 1;
    styles.left['flex'] = 1;
    
    styles.right['marginLeft'] = 34;
    
    leftText = 'Some items require you to sign in to view them';
    rightText = 'Sign in';
  }
  else if (variant === 'danger') {
    styles.container['backgroundColor'] = 'pink';
    styles.container['alignItems'] = 'center';

    styles.left['color'] = 'maroon';
    styles.left['width'] = 0;
    styles.left['flexGrow'] = 1;
    styles.left['flex'] = 1;
    
    styles.right['color'] = 'maroon';
    
    leftText = 'There was a problem, and your recent changes may not have saved';
    rightText = 'Retry';
  }
  else if (variant === 'warning') {
    styles.container['backgroundColor'] = 'lightyellow';
    styles.container['justifyContent'] = 'space-between';

    styles.left['color'] = 'brown';

    styles.right['color'] = 'brown';
    
    leftText = 'Read Only';
    rightText = 'X';
  }
  
  return (
    <View style={styles.container as any}>
      <Text style={styles.left as any}>{leftText}</Text>
      <Text style={styles.right as any}>{rightText}</Text>
    </View>
  );
}

const PrimaryToastTest: React.FunctionComponent = () => {
  return (
    <Notification variant={NotificationVariant[NotificationVariant.primary]}/>
  );
};

const NeutralToastTest: React.FunctionComponent = () => {
  return (
    <Notification variant={NotificationVariant[NotificationVariant.neutral]}/>
  );
};

const DangerToastTest: React.FunctionComponent = () => {
  return (
    <Notification variant={NotificationVariant[NotificationVariant.danger]}/>
  );
};

const WarningToastTest: React.FunctionComponent = () => {
  return (
    <Notification variant={NotificationVariant[NotificationVariant.warning]}/>
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
