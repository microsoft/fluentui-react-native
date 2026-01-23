import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Platform } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { SWITCH_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { Switch } from '@fluentui-react-native/switch';

import { CustomizedSwitch } from './CustomizedSwitch';
import { E2ESwitchTest } from './E2ESwitchTest';
import { commonTestStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const styles = StyleSheet.create({
  square: {
    backgroundColor: 'red',
    width: 100,
    height: 100,
  },
});

const StandardUsage: React.FunctionComponent = () => {
  const memoizedStyles = React.useMemo(
    () => (Platform.OS === 'android' ? { ...commonTestStyles.androidContainer, height: 180 } : commonTestStyles.settingsPicker),
    [],
  );
  return (
    <View style={memoizedStyles}>
      <Switch defaultChecked={true} label={'Default Checked True'} />
      <Switch defaultChecked={false} label={'Default Checked False'} />
      <Switch defaultChecked={true} label={'Disabled Default Checked True'} disabled />
      <Switch defaultChecked={false} label={'Disabled Default Checked False'} disabled />
    </View>
  );
};

const OnChangeUsage: React.FunctionComponent = () => {
  const [displaySquare, setDisplaySquare] = React.useState(true);

  const defaultToggleSquare = (_e: InteractionEvent, checked: boolean) => {
    setDisplaySquare(checked);
  };

  const memoizedStyles = React.useMemo(
    () => (Platform.OS === 'android' ? { ...commonTestStyles.androidContainer, height: 150 } : commonTestStyles.settingsPicker),
    [],
  );

  return (
    <View style={memoizedStyles}>
      <Switch label={'Toggle Square'} defaultChecked={true} onChange={defaultToggleSquare} />
      {displaySquare && <View style={styles.square} />}
    </View>
  );
};

const ControlSwitchValues: React.FunctionComponent = () => {
  const [toggleSwitch, setToggleSwitch] = React.useState(true);

  const toggleSwitchTrue = () => {
    setToggleSwitch(true);
  };

  const toggleSwitchFalse = () => {
    setToggleSwitch(false);
  };

  const memoizedStyles = React.useMemo(
    () => (Platform.OS === 'android' ? { ...commonTestStyles.androidContainer, height: 150 } : commonTestStyles.settingsPicker),
    [],
  );

  return (
    <View style={memoizedStyles}>
      <Button onClick={toggleSwitchTrue}>Toggle Switch True</Button>
      <Button onClick={toggleSwitchFalse}>Toggle Switch False</Button>
      <Switch label={'Switch Value Being Controlled'} checked={toggleSwitch} />
    </View>
  );
};

const LabelPosition: React.FunctionComponent = () => {
  return (
    <View style={commonTestStyles.settingsPicker}>
      <Switch defaultChecked={true} labelPosition={'before'} label={'before'} />
      <Switch defaultChecked={true} labelPosition={'after'} label={'after'} />
      {Platform.OS !== 'android' && <Switch defaultChecked={true} labelPosition={'above'} label={'above'} />}
    </View>
  );
};

const OnOffText: React.FunctionComponent = () => {
  return (
    <View style={commonTestStyles.settingsPicker}>
      <Switch defaultChecked={true} labelPosition={'before'} label={'Autosave'} onText={'On'} offText={'Off'} />
      <Switch defaultChecked={true} labelPosition={'above'} label={'Autosave'} onText={'On'} offText={'Off'} />
      <Switch defaultChecked={true} labelPosition={'after'} label={'Autosave'} onText={'On'} offText={'Off'} />
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
    component: () => <OnChangeUsage />,
  },
  {
    name: 'Control Switch Values',
    component: () => <ControlSwitchValues />,
  },
  Platform.select({
    android: null,
    default: {
      name: 'Label Position',
      component: () => <LabelPosition />,
    },
  }),
  Platform.select({
    android: null,
    default: {
      name: 'On/Off Text',
      component: () => <OnOffText />,
    },
  }),
  Platform.select({
    android: null,
    default: {
      name: 'Customized Tokens',
      component: () => <CustomizedSwitch />,
    },
  }),
];

const e2eSections: TestSection[] = [
  {
    name: 'Switch E2E Testing',
    component: E2ESwitchTest,
  },
];

export const SwitchTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description = 'Switch is a control that has two mutually exclusive states.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Switch/SPEC.md';

  return (
    <Test name="Switch Test" description={description} spec={spec} sections={toggleSections} status={status} e2eSections={e2eSections} />
  );
};
