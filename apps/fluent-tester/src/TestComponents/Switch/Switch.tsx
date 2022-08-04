import * as React from 'react';
import { Test, TestSection, PlatformStatus } from '../Test';
import { SWITCH_TESTPAGE } from './consts';
import { View, StyleSheet } from 'react-native';
import { Switch } from '@fluentui-react-native/switch';
import { E2ESwitchTest } from './E2ESwitchTest';
import { commonTestStyles } from '../Common/styles';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
<<<<<<< HEAD
import { CustomizedSwitch } from './CustomizedSwitch';
=======
>>>>>>> 06349f5cde26a7be2eda16de9cd11fedb71bd525

const styles = StyleSheet.create({
  square: {
    backgroundColor: 'red',
    width: 100,
    height: 100,
  },
});

const StandardUsage: React.FunctionComponent = () => {
  return (
    <View style={commonTestStyles.settingsPicker}>
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

  return (
    <View style={commonTestStyles.settingsPicker}>
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

  return (
    <View style={commonTestStyles.settingsPicker}>
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
      <Switch defaultChecked={true} labelPosition={'above'} label={'above'} />
    </View>
  );
};

const OnOffText: React.FunctionComponent = () => {
  return (
    <View style={commonTestStyles.settingsPicker}>
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
    component: () => <OnChangeUsage />,
  },
  {
    name: 'Control Switch Values',
    component: () => <ControlSwitchValues />,
  },
  {
    name: 'Label Position',
    component: () => <LabelPosition />,
  },
  {
    name: 'On/Off Text',
    component: () => <OnOffText />,
  },
  {
    name: 'Customized Tokens',
    component: () => <CustomizedSwitch />,
  },
  {
    name: 'Switch E2E Testing',
    component: () => <E2ESwitchTest />,
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

  const description = 'Switch is a control that has two mutually exclusive states.';

  return <Test name="Switch Test" description={description} sections={toggleSections} status={status}></Test>;
};
