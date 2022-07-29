import * as React from 'react';
import { Test, TestSection, PlatformStatus } from '../Test';
import { SWITCH_TESTPAGE } from './consts';
import { View, StyleSheet } from 'react-native';
import { Switch } from '@fluentui-react-native/switch';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  square: {
    backgroundColor: 'red',
    width: 100,
    height: 100,
  },
});

const StandardUsage: React.FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <Switch defaultChecked={true} label={'Default Checked True'} />
      <Switch defaultChecked={false} label={'Default Checked False'} />
    </View>
  );
};

const OnChangeUsage: React.FunctionComponent = () => {
  const defaultDisplaySquare = true;
  const [displaySquare, setDisplaySquare] = React.useState(defaultDisplaySquare);

  const toggleSquare = (event, checked) => {
    setDisplaySquare(checked);
  };

  return (
    <View style={styles.container}>
      <Switch defaultChecked={defaultDisplaySquare} onChange={toggleSquare} />
      {displaySquare && <View style={styles.square} />}
    </View>
  );
};

const LabelPosition: React.FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <Switch defaultChecked={true} labelPosition={'before'} label={'before'} />
      <Switch defaultChecked={true} labelPosition={'after'} label={'after'} />
      <Switch defaultChecked={true} labelPosition={'above'} label={'above'} />
    </View>
  );
};

const OnOffText: React.FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <Switch defaultChecked={true} labelPosition={'before'} label={'Autosave'} onText={'On'} offText={'Off'} />
      <Switch defaultChecked={true} labelPosition={'after'} label={'Autosave'} onText={'On'} offText={'Off'} />
      <Switch defaultChecked={true} labelPosition={'above'} label={'Autosave'} onText={'On'} offText={'Off'} />
    </View>
  );
};

const toggleSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: SWITCH_TESTPAGE,
    component: () => <StandardUsage />,
  },
  {
    name: 'onChange Usage',
    testID: SWITCH_TESTPAGE,
    component: () => <OnChangeUsage />,
  },
  {
    name: 'Label Position',
    testID: SWITCH_TESTPAGE,
    component: () => <LabelPosition />,
  },
  {
    name: 'On/Off Text',
    testID: SWITCH_TESTPAGE,
    component: () => <OnOffText />,
  },
];

export const SwitchTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'Switch is a button that has 2 states.';

  return <Test name="Switch Test" description={description} sections={toggleSections} status={status}></Test>;
};
