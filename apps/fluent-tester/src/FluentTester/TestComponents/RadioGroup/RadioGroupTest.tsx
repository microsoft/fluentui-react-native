import * as React from 'react';
import { View } from 'react-native';
import { RadioButton, RadioGroup, Separator } from '@fluentui/react-native';
import { RADIOGROUP_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const basicRadioGroup: React.FunctionComponent<{}> = () => {
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
      <RadioGroup label="Uncontrolled RadioGroup" defaultSelectedKey="B" onChange={onChange}>
        <RadioButton content="Option A" buttonKey="A" ariaLabel="Test Aria Label" />
        <RadioButton content="Option B" buttonKey="B" />
        <RadioButton content="Option C (disabled)" buttonKey="C" disabled={true} />
        <RadioButton content="Option D" buttonKey="D" />
      </RadioGroup>
      <Separator />
      <RadioGroup label="Controlled RadioGroup" selectedKey={selectedKey} onChange={onChange2}>
        {/* View added to test ariaPosInSet and ariaSetSize properties which are not auto-generated when
        RadioButtons are not direct children of RadioGroup. */}
        <View>
          <RadioButton content="Option A" buttonKey="A" ariaLabel="Test Aria Label" ariaPosInSet={1} ariaSetSize={4} />
          <RadioButton content="Option B" buttonKey="B" ariaPosInSet={2} ariaSetSize={4} />
          <RadioButton content="Option C" buttonKey="C" ariaPosInSet={3} ariaSetSize={4} />
          <RadioButton content="Option D" buttonKey="D" ariaPosInSet={4} ariaSetSize={4} />
        </View>
      </RadioGroup>
    </View>
  );
};

const radioGroupSections: TestSection[] = [
  {
    name: 'Basic RadioGroup Usage',
    testID: RADIOGROUP_TESTPAGE,
    component: basicRadioGroup,
  },
];

export const RadioGroupTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'No description.';

  return <Test name="RadioGroup Test" description={description} sections={radioGroupSections} status={status}></Test>;
};
