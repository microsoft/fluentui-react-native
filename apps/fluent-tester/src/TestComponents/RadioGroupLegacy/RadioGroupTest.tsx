import * as React from 'react';
import { View } from 'react-native';
import { RadioButton, RadioGroup, Separator } from '@fluentui/react-native';
import { RADIOGROUP_TESTPAGE } from '../../../../E2E/src/RadioGroup/consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { E2ERadioGroupTest } from './RadioGroupE2ETest';

const BasicRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    console.log(key);
  };

  const [selectedKey, setSelectedKey] = React.useState('C');

  const onChange2 = React.useCallback((key: string) => {
    if (key == 'A') {
      setSelectedKey('A');
    } else if (key == 'B') {
      setSelectedKey('B');
    } else if (key == 'C') {
      setSelectedKey('C');
    } else if (key == 'D') {
      setSelectedKey('D');
    }
  }, []);

  return (
    <View>
      <RadioGroup label="Uncontrolled RadioGroup" defaultSelectedKey="X" onChange={onChange}>
        <RadioButton content="Option W" buttonKey="W" accessibilityLabel="Test Accessibility Label" />
        <RadioButton content="Option X" buttonKey="X" />
        <RadioButton content="Option Y (disabled)" buttonKey="C" disabled={true} />
        <RadioButton content="Option Z" buttonKey="Z" />
      </RadioGroup>
      <Separator />
      <RadioGroup label="Controlled RadioGroup" selectedKey={selectedKey} onChange={onChange2}>
        <View>
          <RadioButton
            content="Option A"
            buttonKey="A"
            accessibilityLabel="Test Accessibility Label"
            accessibilityPositionInSet={1}
            accessibilitySetSize={4}
          />
          <RadioButton content="Option B" buttonKey="B" accessibilityPositionInSet={2} accessibilitySetSize={4} />
          <RadioButton content="Option C" buttonKey="C" accessibilityPositionInSet={3} accessibilitySetSize={4} />
          <RadioButton content="Option D" buttonKey="D" accessibilityPositionInSet={4} accessibilitySetSize={4} />
        </View>
      </RadioGroup>
    </View>
  );
};

const radioGroupSections: TestSection[] = [
  {
    name: 'Basic RadioGroup Usage',
    testID: RADIOGROUP_TESTPAGE,
    component: BasicRadioGroup,
  },
  {
    name: 'RadioGroup for E2E Testing',
    component: E2ERadioGroupTest,
  },
];

export const RadioGroupTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description = 'No description.';

  return <Test name="RadioGroup Test" description={description} sections={radioGroupSections} status={status} />;
};
