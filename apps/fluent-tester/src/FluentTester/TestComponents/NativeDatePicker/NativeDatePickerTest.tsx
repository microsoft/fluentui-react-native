import { Button } from '@fluentui-react-native/button';
import { NativeDatePicker } from '@fluentui-react-native/experimental-native-date-picker';
import { NATIVEDATEPICKER_TESTPAGE } from './consts';
import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { PlatformStatus, Test, TestSection } from '../Test';
import { Text } from '@fluentui/react-native';

const nativeDatePicker: React.FunctionComponent<{}> = () => {
  // const [date, setDate] = React.useState('Foo')

return (
    <Stack style={stackStyle}>
      <Text>Foo</Text>
      {/* <Button content="Get Date" onClick={() => setDate(MSFDatePickerManager.startDate)} /> */}
      <NativeDatePicker>
        <Button content="Show date picker" />
      </NativeDatePicker>
      <NativeDatePicker mode="dateTime">
        <Button content="Show date time picker" />
      </NativeDatePicker>
      <Button content="3" />
      <Button content="4" />
    </Stack>
  );
};

const nativeDatePickerSections: TestSection[] = [
  {
    name: 'Native Date Picker',
    testID: NATIVEDATEPICKER_TESTPAGE,
    component: nativeDatePicker,
  },
];

export const NativeDatePickerTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'N/A',
    uwpStatus: 'N/A',
    iosStatus: 'Experimental',
    macosStatus: 'N/A',
    androidStatus: 'N/A',
  };

  const description =
  'A Native date picker component using the Fluent Design System.  Currently only implemented on iOS.';

  return <Test name="Native Date Picker Test" description={description} sections={nativeDatePickerSections} status={status}></Test>;
};
